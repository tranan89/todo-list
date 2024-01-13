import type { Context, Next } from 'koa';

const loggerMiddleware = () => (ctx: Context, next: Next) => {
	Object.defineProperty(ctx, 'logger', {
		get() {
			return console; // TODO: use proper logger
		},
		enumerable: true,
	});
	return next();
};

export default loggerMiddleware;
