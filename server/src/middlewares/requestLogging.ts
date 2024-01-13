import type { Context, Next } from 'koa';

const requestLoggingMiddleware = () => (ctx: Context, next: Next) => {
	const { method, url } = ctx.request;

	ctx.logger.info(`Incoming request: ${method} ${url}`);

	return next();
};

export default requestLoggingMiddleware;
