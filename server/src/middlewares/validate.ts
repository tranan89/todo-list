import type { Context, Next } from 'koa';
import { z } from 'zod';

type Schemas<body, query, params> = {
	body?: body extends z.Schema ? body : undefined;
	query?: query extends z.Schema ? query : undefined;
	params?: params extends z.Schema ? params : undefined;
};
type Result<body, query, params> = {
	parsedBody: body extends z.Schema ? z.infer<body> : undefined;
	parsedQuery: query extends z.Schema ? z.infer<query> : undefined;
	parsedParams: params extends z.Schema ? z.infer<params> : undefined;
};

export interface ValidateContext {
	validate: <body, query, params>(
		schemas: Schemas<body, query, params>,
	) => Result<body, query, params>;
}

const validate = (ctx: Context) => {
	const validate: ValidateContext['validate'] = (schemas) => {
		const { body: bodySchema, query: querySchema, params: paramsSchema } = schemas;
		const { query = {}, params = {}, request: { body = {} } = {} } = ctx;
		let errorMsg = '';
		let parsedBody;
		let parsedQuery;
		let parsedParams;

		if (bodySchema) {
			const result = bodySchema.safeParse(body);

			if (!result.success) {
				errorMsg += `Body validation error: ${result.error.message} `;
			} else {
				parsedBody = result.data;
			}
		}
		if (querySchema) {
			const result = querySchema.safeParse(query);

			if (!result.success) {
				errorMsg += `Query validation error: ${result.error.message} `;
			} else {
				parsedQuery = result.data;
			}
		}
		if (paramsSchema) {
			const result = paramsSchema.safeParse(params);

			if (!result.success) {
				errorMsg += `Params validation error: ${result.error.message} `;
			} else {
				parsedParams = result.data;
			}
		}
		errorMsg = errorMsg.trim();

		ctx.assert(!errorMsg, 400, errorMsg);

		return {
			parsedBody,
			parsedQuery,
			parsedParams,
		};
	};
	return validate;
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

export default validateMiddleware;
