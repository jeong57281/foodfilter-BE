import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import http from 'http';
import favicon from 'serve-favicon';
import indexRouter from './routes/index.js';
import history from 'connect-history-api-fallback';
import socket from './socket.js';
import morgan from 'morgan';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';

// .env
dotenv.config();

// es6 __dirname not defined 
const __dirname = path.resolve();

// express
const app = express();
app.set('port', '8080');

// global variable
const roomArray = [];
global.roomArray = roomArray;

// favicon middleware
app.use(favicon(path.join(__dirname, 'public', './img/favicon.ico')));

// express session
const sessionMiddleware = session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false
  }
});
// 1.5 버전 이후부터는 cookie-parser 미들웨어 순서와 상관이 없다.
app.use(sessionMiddleware); 

// morgan
if (process.env.NODE_ENV === 'production') app.use(morgan('combined'));
else app.use(morgan('dev'));

// other middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// connect vuejs router
app.use(history());

// backend router
app.use('/', indexRouter);

// create server
const server = http.createServer(app).listen(app.get('port'), () => {
  console.log(app.get('port') + ' 빈 포트에서 대기 중');
});

// socket
socket(server, app, sessionMiddleware);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err.message);
});