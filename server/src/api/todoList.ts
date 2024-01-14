import Joi from 'joi';
import db from '../database.js';
import type { Context } from '../types/index.js';
import { getSelectFromInclude } from './utils/index.js';
import { getTodoListRoom, todoListUpdatedEvent } from './constants/socket.js';

interface getListsContext extends Context {
	parsedQuery: {
		include?: string[];
	};
}
export const getLists = async (ctx: getListsContext) => {
	ctx.validate({
		query: Joi.object().keys({
			include: Joi.array().items(Joi.string()).single(),
		}),
	});
	const select = getSelectFromInclude(ctx.parsedQuery.include as string[]);

	const data = await db.todoList.findMany({
		select,
		orderBy: {
			updatedAt: 'desc',
		},
	});

	ctx.body = { data };
};

interface getListsContext extends Context {
	parsedParams: {
		listId: number;
	};
	parsedQuery: {
		include?: string[];
	};
}
export const getListById = async (ctx: Context) => {
	ctx.validate({
		params: Joi.object()
			.keys({
				listId: Joi.number().required(),
			})
			.required(),
		query: Joi.object().keys({
			include: Joi.array().items(Joi.string()).single(),
		}),
	});
	const select = getSelectFromInclude(ctx.parsedQuery.include as string[]);

	const data = await db.todoList.findUnique({
		where: {
			id: ctx.parsedParams.listId,
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
export const createList = async (ctx: createListContext) => {
	ctx.validate({
		body: Joi.object()
			.keys({
				name: Joi.string().required(),
			})
			.unknown()
			.required(),
	});
	const { parsedRequestBody } = ctx;

	const { id: listId } = await db.todoList.create({ data: parsedRequestBody });

	ctx.body = { data: { listId } };
};

interface updateListContext extends Context {
	parsedParams: {
		listId: number;
	};
	parsedRequestBody: {
		name?: string;
		taskIds?: number[];
	};
}
export const updateListById = async (ctx: updateListContext) => {
	ctx.validate({
		params: Joi.object()
			.keys({
				listId: Joi.number().required(),
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
		parsedParams: { listId },
	} = ctx;

	await db.todoList.update({
		where: {
			id: listId,
		},
		data: parsedRequestBody,
	});

	ctx.io.emit({
		room: getTodoListRoom(listId as number),
		event: todoListUpdatedEvent,
		data: { listId },
	});

	ctx.status = 204;
};

interface joinListRoomContext extends Context {
	parsedParams: {
		listId: number;
	};
	parsedRequestBody: {
		socketId: string;
	};
}
export const joinListRoom = async (ctx: joinListRoomContext) => {
	ctx.validate({
		params: Joi.object()
			.keys({
				listId: Joi.number().required(),
			})
			.required(),
		body: Joi.object()
			.keys({
				socketId: Joi.string().required(),
			})
			.unknown()
			.required(),
	});
	const {
		parsedParams: { listId },
		parsedRequestBody: { socketId },
	} = ctx;

	ctx.io.joinRoom({ socketId, room: getTodoListRoom(listId as number) });

	ctx.status = 204;
};
