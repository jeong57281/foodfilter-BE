/**
 * 방 정보를 담는 객체 - 전역 변수
 * @typedef {object} roomDB
 * @property {roomIdProperty} roomId
 */

/**
 * 유저 정보를 담는 객체
 * @typedef {object} roomIdProperty
 * @property {sessionIdProperty} sid
 */

/**
 * 위치 정보를 담는 객체
 * @typedef {object} locProperty
 * @property {number} lat
 * @property {number} lng
 */

/**
 * 유저 정보 객체
 * @typedef {object} sessionIdProperty
 * @property {string} name
 * @property {locProperty} loc
 * @property {number[]} filter
 * @property {number} same - 같은 세션의 접속자 수
 */