import Joi from 'joi';
import db from '../database.js';
import type { Context } from '../types/index.js';
import { getSelectFromInclude } from './utils/index.js';

export const getListById = async (ctx: Context): Promise<void> => {
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
	const select = getSelectFromInclude(ctx.parsedQuery.include as string[]);

	const data = await db.todoList.findUnique({
		where: {
			id: ctx.parsedParams.id,
		},
		select,
	});

	ctx.body = { data };
};

interface createListContext extends Context {
	parsedRequestBody: {
		name: string;
	};
}
export const createList = async (ctx: createListContext): Promise<void> => {
	ctx.validate({
		body: Joi.object()
			.keys({
				name: Joi.string().required(),
			})
			.unknown()
			.required(),
	});
	const { parsedRequestBody } = ctx;

	const { id } = await db.todoList.create({ data: parsedRequestBody });

	ctx.body = { data: { id } };
};

interface updateListContext extends Context {
	parsedRequestBody: {
		name?: string;
		taskIds?: number[];
	};
}
export const updateListById = async (ctx: updateListContext): Promise<void> => {
	ctx.validate({
		params: Joi.object()
			.keys({
				id: Joi.number().required(),
			})
			.required(),
		body: Joi.object()
			.keys({
				name: Joi.string(),
				taskIds: Joi.array().items(Joi.number()),
			})
			.min(1)
			.unknown()
			.required(),
	});
	const {
		parsedRequestBody,
		parsedParams: { id },
	} = ctx;

	await db.todoList.update({
		where: {
			id,
		},
		data: parsedRequestBody,
	});

	ctx.body = { data: { id } };
};
