import type { Context, Next } from 'koa';
import Joi from 'joi';

type Schemas = {
	body?: Joi.Schema;
	query?: Joi.Schema;
	params?: Joi.Schema;
};

const validate = (ctx: Context) => (schemas: Schemas) => {
	const { body: bodySchema, query: querySchema, params: paramsSchema } = schemas;
	const { query = {}, params = {}, request: { body = {} } = {} } = ctx;
	let errorMsg = '';

	if (bodySchema) {
		const { error, value } = bodySchema.validate(body);

		if (error) {
			errorMsg += `Body validation error: ${error.message} `;
		} else {
			ctx.parsedRequestBody = {
				...value, // Parse numbers and booleans from strings and set defaults, can't mutate ctx.body
			};
		}
	}
	if (querySchema) {
		const { error, value } = querySchema.validate(query);

		if (error) {
			errorMsg += `Query validation error: ${error.message} `;
		} else {
			ctx.parsedQuery = {
				// Parse numbers and booleans from strings and set defaults
				// can't mutate ctx.query
				...value,
			};
		}
	}
	if (paramsSchema) {
		const { error, value } = paramsSchema.validate(params);

		if (error) {
			errorMsg += `Params validation error: ${error.message} `;
		} else {
			ctx.parsedParams = {
				// Parse numbers and booleans from strings and set defaults
				// can't mutate ctx.query
				...value,
			};
		}
	}
	errorMsg = errorMsg.trim();

	return ctx.assert(!errorMsg, 400, errorMsg);
};

const validateMiddleware = () => (ctx: Context, next: Next) => {
	Object.defineProperty(ctx, 'validate', {
		get() {
			return validate(ctx);
		},
		enumerable: true,
	});
	return next();
};

export interface ValidateContext {
	parsedParams: {
		listId?: number;
		taskId?: number;
	};
	parsedQuery: {
		include?: string[];
	};
}

export default validateMiddleware;
