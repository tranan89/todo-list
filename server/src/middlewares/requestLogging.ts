import type { Context, Next } from 'koa';

const requestLoggingMiddleware = () => (ctx: Context, next: Next) => {
	const { method, url } = ctx.request;

	if (process.env.NODE_ENV !== 'test') {
		ctx.logger.info(`Incoming request: ${method} ${url}`);
	}

	return next();
};

export default requestLoggingMiddleware;
