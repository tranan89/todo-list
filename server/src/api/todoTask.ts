import { z } from 'zod';
import db from '../database.js';
import type { Context } from '../types/index.js';
import { getSelectFromInclude } from './utils/index.js';
import { includeSchema } from './utils/schemas.js';
import {
	getTodoListRoom,
	todoTaskCreatedEvent,
	todoTaskDeletedEvent,
	todoTaskUpdatedEvent,
} from './constants/socket.js';

export const getTasksByListId = async (ctx: Context) => {
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

	const data = await db.todoTask.findMany({
		where: {
			listId: parsedParams.listId,
		},
		select,
	});

	ctx.body = { data };
};

export const getTaskById = async (ctx: Context) => {
	const { parsedQuery, parsedParams } = ctx.validate({
		params: z.object({
			listId: z.coerce.number(),
			taskId: z.coerce.number(),
		}),
		query: z
			.object({
				include: includeSchema,
			})
			.partial(),
	});
	const select = getSelectFromInclude(parsedQuery.include);

	const data = await db.todoTask.findUnique({
		where: {
			id: parsedParams.taskId,
		},
		select,
	});

	ctx.body = { data };
};

export const createTask = async (ctx: Context) => {
	const {
		parsedParams: { listId },
		parsedBody,
	} = ctx.validate({
		params: z.object({
			listId: z.coerce.number(),
		}),
		body: z.object({
			name: z.string().min(2),
		}),
	});

	const taskId = await db.$transaction(async (tx) => {
		const { id: taskId } = await tx.todoTask.create({
			data: {
				...parsedBody,
				listId,
			},
		});

		const list = await tx.todoList.findUnique({
			where: { id: listId },
			select: { taskIds: true },
		});

		if (!list) throw new Error('todoTask.createTask.listNotFound');

		await tx.todoList.update({
			where: {
				id: listId,
			},
			data: {
				taskIds: [taskId, ...list.taskIds],
			},
		});

		return taskId;
	});

	ctx.io.emit({
		room: getTodoListRoom(listId as number),
		event: todoTaskCreatedEvent,
		data: { listId, taskId },
	});

	ctx.body = { data: { taskId } };
};

export const updateTaskById = async (ctx: Context) => {
	const {
		parsedParams: { listId, taskId },
		parsedBody,
	} = ctx.validate({
		params: z.object({
			listId: z.coerce.number(),
			taskId: z.coerce.number(),
		}),
		body: z.object({
			name: z.string().min(2),
			description: z.string(),
		}),
	});

	await db.todoTask.update({
		where: {
			id: taskId,
		},
		data: parsedBody,
	});

	ctx.io.emit({
		room: getTodoListRoom(listId as number),
		event: todoTaskUpdatedEvent,
		data: { listId, taskId },
	});

	ctx.status = 204;
};

export const deleteTaskById = async (ctx: Context) => {
	const {
		parsedParams: { listId, taskId },
	} = ctx.validate({
		params: z.object({
			listId: z.coerce.number(),
			taskId: z.coerce.number(),
		}),
	});

	await db.$transaction(async (tx) => {
		await tx.todoTask.delete({
			where: {
				id: taskId,
			},
		});

		const list = await tx.todoList.findUnique({
			where: { id: listId },
			select: { taskIds: true },
		});

		if (!list) throw new Error('todoTask.deleteTask.listNotFound');

		await tx.todoList.update({
			where: {
				id: listId,
			},
			data: {
				taskIds: list.taskIds.filter((id) => id !== taskId),
			},
		});
	});

	ctx.io.emit({
		room: getTodoListRoom(listId as number),
		event: todoTaskDeletedEvent,
		data: { listId, taskId },
	});

	ctx.status = 204;
};
