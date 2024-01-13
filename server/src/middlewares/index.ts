import compose from 'koa-compose';
import bodyParser from 'koa-body';
import type { Server } from 'socket.io';
import logger from './logger.js';
import validate from './validate.js';
import io from './io.js';
import requestLogging from './requestLogging.js';
import headers from './headers.js';

const middlewares = ({ ioServer }: { ioServer: Server }) =>
	compose([
		headers(),
		logger(),
		requestLogging(),
		bodyParser(),
		validate(),
		io({ ioServer }),
		// TODO: add header parser, error handler, metrics etc
	]);

export default middlewares;
