import compose from 'koa-compose';
import bodyParser from 'koa-body';
import type { Server } from 'socket.io';
import validate from './validate.js';
import io from './io.js';

const middlewares = ({ ioServer }: { ioServer: Server }) =>
	compose([
		bodyParser(),
		validate(),
		io({ ioServer }),
		// TODO: add header parser, logger, error handler, metrics etc
	]);

export default middlewares;
