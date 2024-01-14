import Koa from 'koa';
import { createServer as createHttpServer, type Server } from 'http';
import { Server as SocketIoServer } from 'socket.io';
import router from './api/router.js';
import middlewares from './middlewares/index.js';

export default function createServer(): { httpServer: Server; ioServer: SocketIoServer } {
	const app = new Koa();
	const httpServer = createHttpServer(app.callback());
	const ioServer = new SocketIoServer(httpServer, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	});
	app.use(middlewares({ ioServer })).use(router.routes()).use(router.allowedMethods());

	return { httpServer, ioServer };
}
