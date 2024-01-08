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

interface createTaskContext extends Context {
	parsedRequestBody: {
		name: string;
	};
}
export const createTask = async (ctx: createTaskContext): Promise<void> => {
	ctx.validate({
		body: Joi.object()
			.keys({
				name: Joi.string().required(),
			})
			.unknown()
			.required(),
	});
	const { parsedRequestBody } = ctx;

	const { id } = await db.todoTask.create({ data: parsedRequestBody });

	ctx.body = { data: { id } };
};

interface updateTaskContext extends Context {
	parsedRequestBody: {
		name?: string;
		description?: string;
	};
}
export const updateTaskById = async (ctx: updateTaskContext): Promise<void> => {
	ctx.validate({
		params: Joi.object()
			.keys({
				id: Joi.number().required(),
			})
			.required(),
		body: Joi.object()
			.keys({
				name: Joi.string().required(),
				description: Joi.string().required(),
			})
			.unknown()
			.required(),
	});
	const {
		parsedRequestBody,
		parsedParams: { id },
	} = ctx;

	await db.todoTask.update({
		where: {
			id,
		},
		data: parsedRequestBody,
	});

	ctx.body = { data: { id } };
};
