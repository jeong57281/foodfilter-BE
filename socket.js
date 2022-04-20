import axios from 'axios';
import SocketIO from 'socket.io';

export default (server, app, sessionMiddleware) => {
	const io = SocketIO(server);
	// 라우터에서 io 객체를 사용할 수 있도록 함.
	app.set('io', io);
	// 랜덤 닉네임
	const action = ['똥만싸는', '밥먹는', '코파는', '못생긴', '귀여운', '징그러운', '예쁜', '많이먹는', '야생의', '부잣집', '애교갑', '미친'];
	const animal = ['타조', '돼지', '사슴', '코끼리', '강아지', '문어', '오징어', '기린', '비둘기', '닭', '침팬지', '늑대', '여우', '호랑이', '코알라', '너구리', '족제비', '치타', '곰', '펭귄', '개미핥기', '생쥐', '해달', '몽구스', '공작', '꾀꼬리', '토끼', '사자', '하이에나', '공룡', '나무늘보'];
	// 네임스페이스 부여
	const room = io.of('/room');
	// 세션 미들웨어
	io.use((socket, next) => {
		sessionMiddleware(socket.request, socket.request.res, next);
	});
	room.on('connection', function (socket) {
		const defaultFilter = [true, true, true, true];
		const month = Math.floor(Math.random() * 101) % 12;
		const day = Math.floor(Math.random() * 101) % 31;
		// 방 아이디 추출
		const req = socket.request;
		const { headers: { referer } } = req;
		const roomId = referer
			.split('/')[referer.split('/').length - 1]
			.replace(/\?.+/, '');
		// 접속중인 방 정보 가져오기
		function getRoom() {
			const roomIdx = roomArray.findIndex(x => x.room === roomId);
			if (roomIdx === -1) return undefined;
			const room = roomArray[roomIdx];
			return room;
		}
		socket.join(roomId);
		const room = getRoom();
		const sid = req.sessionID;
		if (room && sid) {
			if (room.userInfo.findIndex(x => x.sid === sid) === -1) {
				// 사용자 정보를 추가하고, 모든 사용자들에게 접속을 알린다.
				const myInfo = {
					room: roomId,
					sid: sid,
					name: `${action[month]} ${animal[day]}`,
					loc: {
						lat: 37.3595704,
						lng: 127.105399
					},
					filter: defaultFilter,
					same: 0
				}
				room.userInfo.push(myInfo);
				socket.to(roomId).emit('join', myInfo);
				// 이름 정보를 초기화한다.
				socket.emit('init', {
					sid: sid,
					name: `${action[month]} ${animal[day]}`,
					filter: defaultFilter
				});
			}
			else {
				const userIdx = room.userInfo.findIndex(x => x.sid === sid);
				if (userIdx != -1) {
					room.userInfo[userIdx].same++;
					// 이름 정보를 기존의 정보로 초기화한다.
					socket.emit('init', {
						sid: sid,
						name: room.userInfo[userIdx].name,
						filter: room.userInfo[userIdx].filter
					});
				}
			}
			// 현재 접속중인 유저의 정보를 가져온다.
			for (let user of room.userInfo) {
				socket.emit('join', {
					sid: user.sid,
					name: user.name,
					loc: user.loc,
					filter: user.filter,
				});
			}
		}
		socket.on('changeName', function (data) {
			const room = getRoom();
			if (room) {
				const userIdx = room.userInfo.findIndex(x => x.sid === sid);
				if (userIdx != -1) {
					room.userInfo[userIdx].name = data.name;
					socket.to(roomId).emit('changeName', {
						sid: sid,
						name: data.name
					});
				}
			}
		})
		socket.on('changeLoc', function (data) {
			const room = getRoom();
			if (room) {
				const userIdx = room.userInfo.findIndex(x => x.sid === sid);
				if (userIdx != -1) {
					room.userInfo[userIdx].loc = data.loc;
					socket.to(roomId).emit('changeLoc', {
						sid: sid,
						loc: data.loc
					})
				}
			}
		})
		socket.on('changeFilter', function (data) {
			const room = getRoom();
			if (room) {
				const userIdx = room.userInfo.findIndex(x => x.sid === sid);
				if (userIdx != -1) {
					room.userInfo[userIdx].filter = data.filter;
					socket.to(roomId).emit('changeFilter', {
						sid: sid,
						filter: data.filter
					});
				}
			}
		})
		socket.on('disconnect', () => {
			const room = getRoom();
			if (room) {
				const userIdx = room.userInfo.findIndex(x => x.sid === sid);
				if (userIdx != -1) {
					if (!room.userInfo[userIdx].same) {
						room.userInfo.splice(userIdx, 1);
						socket.to(roomId).emit('exit', {
							sid: sid
						});
						socket.leave(roomId);
					}
					else {
						room.userInfo[userIdx].same--;
					}
				}
			}
			const currentRoom = socket.adapter.rooms[roomId];
			const userCount = currentRoom ? currentRoom.size : 0;
			if (userCount === 0) {
				axios.delete(`http://localhost:8080/api/maps?roomId=${roomId}`, {
				})
				.then(() => {
					console.log('방 제거요청 성공');
				})
				.catch((err) => {
					console.log('방 제거요청 실패');
				});
			}
		});
	});
}