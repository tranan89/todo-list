import Joi from 'joi';
import db from '../database.js';
import type { Context } from '../types/index.js';
import { getSelectFromInclude } from './utils/index.js';

export const getTaskById = async (ctx: Context): Promise<void> => {
	ctx.validate({
		params: Joi.object()
			.keys({
				id: Joi.number().required(),
			})
			.required(),
		query: Joi.object().keys({
			include: Joi.array().items(Joi.string()).single(),
		}),
	});
	const id = Number(ctx.params.id);
	const select = getSelectFromInclude(ctx.parsedQuery.include as string[]);

	const data = await db.todoTask.findUnique({
		where: {
			id,
		},
		select,
	});

	ctx.body = { data };
};

export const createTask = async (ctx: Context): Promise<void> => {
	ctx.validate({
		body: Joi.object()
			.keys({
				name: Joi.string().required(),
				description: Joi.string().required(),
			})
			.required(),
	});
	const { parsedRequestBody } = ctx;

	const { id } = await db.todoTask.create({ data: parsedRequestBody });

	ctx.body = { data: { id } };
};
