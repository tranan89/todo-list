import type { Context, Next } from 'koa';

const errorMiddleware = () => async (ctx: Context, next: Next) => {
	try {
		await next();
	} catch (error: any) {
		ctx.status =
			error?.response?.status ||
			error?.response?.statusCode ||
			error.status ||
			error.statusCode ||
			500;

		ctx.logger.error(error);

		if (ctx.status === 400) {
			ctx.body = {
				error: {
					title: error.message,
				},
			};
		}
	}
};

export default errorMiddleware;
