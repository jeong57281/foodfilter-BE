import express from 'express';

const router = express.Router();

router.post('/api/maps', (req, res) => {
	global.roomArray.push({
		room: req.query.roomId,
		userInfo: []
	});
	res.status(201).send('ok');
});

router.get('/api/maps/isvalid', (req, res) => {
	const { headers: { referer } } = req;
	const roomId = referer
		.split('/')[referer.split('/').length - 1]
		.replace(/\?.+/, '');
	const roomIdx = global.roomArray.findIndex(x => x.room === roomId);
	res.status(200).json({
		valid: roomIdx !== -1
	});
})

router.delete('/api/maps', (req, res) => {
	setTimeout(() => {
		const roomId = req.query.roomId;
		const roomIdx = global.roomArray.findIndex(x => x.room === roomId);
		if(roomIdx !== -1){
			const room = global.roomArray[roomIdx];
			if((room !== undefined) && (room.userInfo.length === 0)){
				global.roomArray.splice(roomIdx, 1);
			}
		}
	}, 60000);
	res.send('ok');
});

export default router;