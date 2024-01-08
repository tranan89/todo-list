import Koa from 'koa';
import router from './api/router.js';
import middlewares from './middlewares/index.js';
import type { Context } from './types/index.js';

export default function createHttpServer(): Koa<Context> {
	const server: Koa<Context> = new Koa();
	server.use(middlewares).use(router.routes()).use(router.allowedMethods());
	return server;
}
