import Koa from 'koa';
import { createServer, type Server } from 'http';
import { Server as SocketIoServer } from 'socket.io';
import router from './api/router.js';
import middlewares from './middlewares/index.js';

export default function createHttpServer(): Server {
	const app = new Koa();
	const server = createServer(app.callback());
	const ioServer = new SocketIoServer(server);

	app.use(middlewares({ ioServer })).use(router.routes()).use(router.allowedMethods());

	return server;
}
