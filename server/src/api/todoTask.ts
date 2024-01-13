import Joi from 'joi';
import db from '../database.js';
import type { Context } from '../types/index.js';
import { getSelectFromInclude } from './utils/index.js';
import { getTodoListRoom, todoTaskCreatedEvent, todoTaskUpdatedEvent } from './constants/socket.js';

export const getTaskById = async (ctx: Context) => {
	ctx.validate({
		params: Joi.object()
			.keys({
				listId: Joi.number().required(),
				taskId: Joi.number().required(),
			})
			.required(),
		query: Joi.object().keys({
			include: Joi.array().items(Joi.string()).single(),
		}),
	});
	const select = getSelectFromInclude(ctx.parsedQuery.include as string[]);

	const data = await db.todoTask.findUnique({
		where: {
			id: ctx.parsedParams.taskId,
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
export const createTask = async (ctx: createTaskContext) => {
	ctx.validate({
		params: Joi.object()
			.keys({
				listId: Joi.number().required(),
			})
			.required(),
		body: Joi.object()
			.keys({
				name: Joi.string().required(),
			})
			.unknown()
			.required(),
	});
	const {
		parsedRequestBody,
		parsedParams: { listId },
	} = ctx;

	const taskId = await db.$transaction(async (tx) => {
		const { id: taskId } = await tx.todoTask.create({ data: parsedRequestBody });

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

interface updateTaskContext extends Context {
	parsedRequestBody: {
		name?: string;
		description?: string;
	};
}
export const updateTaskById = async (ctx: updateTaskContext) => {
	ctx.validate({
		params: Joi.object()
			.keys({
				listId: Joi.number().required(),
				taskId: Joi.number().required(),
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
		parsedParams: { taskId, listId },
	} = ctx;

	await db.todoTask.update({
		where: {
			id: taskId,
		},
		data: parsedRequestBody,
	});

	ctx.io.emit({
		room: getTodoListRoom(listId as number),
		event: todoTaskUpdatedEvent,
		data: { listId, taskId },
	});

	ctx.status = 204;
};
