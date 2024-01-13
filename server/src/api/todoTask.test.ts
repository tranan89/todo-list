import { expect, it, describe, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent.js';
import { type Server } from 'http';
import createHttpServer from '../createHttpServer.js';
import db from '../database.js';
import { TodoListMock, TodoTaskMock } from '../types/tests.js';
import * as ioMiddleware from '../middlewares/io.js';
import { getTodoListRoom, todoTaskUpdatedEvent, todoTaskCreatedEvent } from './constants/socket.js';

describe('todo-task', () => {
	let app: Server;
	let request: TestAgent<Test>;
	let ioSpies: { emit: jest.SpyInstance; joinRoom: jest.SpyInstance; leaveRoom: jest.SpyInstance };
	let listId: number;
	const mockTodoList: TodoListMock = {
		name: 'Shopping List',
		taskIds: [99],
	};
	const mockTodoTask: TodoTaskMock = {
		name: 'Employment Agreement',
		description: 'HR',
	};

	beforeAll(() => {
		app = createHttpServer();
		request = supertest(app);
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	beforeEach(async () => {
		await db.todoTask.deleteMany();
		({ id: listId } = await db.todoList.create({
			data: mockTodoList,
		}));

		ioSpies = { emit: jest.fn(), joinRoom: jest.fn(), leaveRoom: jest.fn() };
		jest.spyOn(ioMiddleware, 'io').mockReturnValue(ioSpies as any);
	});

	afterEach(async () => {
		await db.todoTask.deleteMany();
		await db.todoList.deleteMany();
	});

	describe('getTaskById', () => {
		it('return task', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });
			const response = await request.get(`/api/todo-lists/${listId}/tasks/${id}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(expect.objectContaining(mockTodoTask));
		});

		it('return task with projection', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });
			const response = await request
				.get(`/api/todo-lists/${listId}/tasks/${id}`)
				.query({ include: ['name'] });

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual({
				name: mockTodoTask.name,
				id,
			});
		});

		it('return null', async () => {
			const response = await request.get(`/api/todo-lists/${listId}/tasks/123`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(null);
		});

		it('assert params', async () => {
			const response = await request.get(`/api/todo-lists/${listId}/tasks/test`);

			expect(response.status).toBe(400);
			expect(response.text).toEqual('Params validation error: "taskId" must be a number');
		});

		it('assert query', async () => {
			const response = await request.get(`/api/todo-lists/${listId}/tasks/123?foo=bar`);

			expect(response.status).toBe(400);
			expect(response.text).toEqual('Query validation error: "foo" is not allowed');
		});
	});

	describe('createTask', () => {
		const mockTodoTask = {
			name: 'Employment Agreement',
		};

		it('create task and update list', async () => {
			const response = await request.post(`/api/todo-lists/${listId}/tasks`).send(mockTodoTask);
			const { taskId } = response.body.data;

			const task = await db.todoTask.findFirst();
			const updatedList = await db.todoList.findFirst();

			expect(response.status).toBe(200);
			expect(task).toEqual(expect.objectContaining({ ...mockTodoTask, id: taskId }));
			expect(updatedList).toEqual(
				expect.objectContaining({ ...mockTodoList, taskIds: [taskId, ...mockTodoList.taskIds] }),
			);
			expect(ioSpies.emit).toHaveBeenCalledWith({
				room: getTodoListRoom(listId),
				event: todoTaskCreatedEvent,
				data: { listId, taskId },
			});
		});

		it('abort transaction if list update fails', async () => {
			const response = await request.post(`/api/todo-lists/7542/tasks`).send(mockTodoTask);

			const task = await db.todoTask.findFirst();
			const list = await db.todoList.findFirst();

			expect(response.status).toBe(500);
			expect(task).toEqual(null);
			expect(list).toEqual(expect.objectContaining(mockTodoList));
			expect(ioSpies.emit).not.toHaveBeenCalled();
		});

		describe('assert body', () => {
			it(`assert name`, async () => {
				const response = await request
					.post(`/api/todo-lists/${listId}/tasks`)
					.send({ ['name']: undefined });

				expect(response.status).toBe(400);
				expect(response.text).toEqual(`Body validation error: "name" is required`);
			});
		});
	});

	describe('updateTaskById', () => {
		it('update task name and description', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });

			const updatedTask = {
				name: 'Grocery Shopping',
				description: 'Milk, Eggs, Bread',
			};

			const response = await request
				.patch(`/api/todo-lists/${listId}/tasks/${id}`)
				.send(updatedTask);

			const data = await db.todoTask.findFirst();

			expect(response.status).toBe(204);
			expect(data).toEqual(expect.objectContaining({ ...updatedTask, id }));
			expect(ioSpies.emit).toHaveBeenCalledWith({
				room: getTodoListRoom(listId),
				event: todoTaskUpdatedEvent,
				data: { listId, taskId: id },
			});
		});

		describe('assert body', () => {
			Object.keys(mockTodoTask).forEach((key: string) => {
				it(`assert ${key}`, async () => {
					const response = await request
						.patch(`/api/todo-lists/${listId}/tasks/12`)
						.send({ ...mockTodoTask, [key]: undefined });

					expect(response.status).toBe(400);
					expect(response.text).toEqual(`Body validation error: "${key}" is required`);
				});
			});
		});
	});
});
