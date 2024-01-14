import type { Context, Next } from 'koa';

const headersMiddleware = () => (ctx: Context, next: Next) => {
	ctx.set('Access-Control-Allow-Origin', '*');
	ctx.set(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	);
	ctx.set('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, HEAD, OPTIONS');

	return next();
};

export default headersMiddleware;
