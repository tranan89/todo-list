import { z } from 'zod';
import db from '../database.js';
import type { Context } from '../types/index.js';
import { getSelectFromInclude } from './utils/index.js';
import { includeSchema } from './utils/schemas.js';
import { getTodoListRoom, todoListUpdatedEvent } from './constants/socket.js';

export const getLists = async (ctx: Context) => {
	const { parsedQuery } = ctx.validate({
		query: z
			.object({
				include: includeSchema,
			})
			.partial(),
	});
	const select = getSelectFromInclude(parsedQuery.include);

	const data = await db.todoList.findMany({
		select,
		orderBy: {
			updatedAt: 'desc',
		},
	});

	ctx.body = { data };
};

export const getListById = async (ctx: Context) => {
	const { parsedQuery, parsedParams } = ctx.validate({
		params: z.object({
			listId: z.coerce.number(),
		}),
		query: z
			.object({
				include: includeSchema,
			})
			.partial(),
	});
	const select = getSelectFromInclude(parsedQuery.include);

	const data = await db.todoList.findUnique({
		where: {
			id: parsedParams.listId,
		},
		select,
	});

	ctx.body = { data };
};

export const createList = async (ctx: Context) => {
	const { parsedBody } = ctx.validate({
		body: z.object({
			name: z.string().min(2),
		}),
	});

	const { id: listId } = await db.todoList.create({ data: parsedBody });

	ctx.body = { data: { listId } };
};

export const updateListById = async (ctx: Context) => {
	const {
		parsedParams: { listId },
		parsedBody,
	} = ctx.validate({
		params: z.object({
			listId: z.coerce.number(),
		}),
		body: z
			.object({
				name: z.string().min(2),
				taskIds: z.array(z.number()),
			})
			.partial()
			.refine(({ name, taskIds }) => name !== undefined || taskIds !== undefined, {
				message: 'One of the fields must be defined',
			}),
	});

	await db.todoList.update({
		where: {
			id: listId,
		},
		data: parsedBody,
	});

	ctx.io.emit({
		room: getTodoListRoom(listId as number),
		event: todoListUpdatedEvent,
		data: { listId },
	});

	ctx.status = 204;
};

export const joinListRoom = async (ctx: Context) => {
	const {
		parsedParams: { listId },
		parsedBody: { socketId },
	} = ctx.validate({
		params: z.object({
			listId: z.coerce.number(),
		}),
		body: z.object({
			socketId: z.string(),
		}),
	});

	ctx.io.joinRoom({ socketId, room: getTodoListRoom(listId as number) });

	ctx.status = 204;
};
