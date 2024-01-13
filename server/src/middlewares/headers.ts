import type { Context, Next } from 'koa';

const headersMiddleware = () => (ctx: Context, next: Next) => {
	ctx.set('Access-Control-Allow-Origin', '*');

	return next();
};

export default headersMiddleware;
