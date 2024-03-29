import { expect, it, describe, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent.js';
import createServer from '../createServer.js';
import db from '../database.js';
import { TodoListMock, TodoTaskMock } from '../types/tests.js';
import * as ioMiddleware from '../middlewares/io.js';
import {
	getTodoListRoom,
	todoTaskUpdatedEvent,
	todoTaskCreatedEvent,
	todoTaskDeletedEvent,
} from './constants/socket.js';

describe('todo-task', () => {
	let request: TestAgent<Test>;
	let ioSpies: { emit: jest.SpyInstance; joinRoom: jest.SpyInstance; leaveRoom: jest.SpyInstance };
	let listId: number;
	const mockTodoList: TodoListMock = {
		name: 'Shopping List',
		taskIds: [99],
	};
	const mockTodoTask: TodoTaskMock = {
		listId: -1,
		name: 'Employment Agreement',
		description: 'HR',
	};

	beforeAll(() => {
		const { httpServer } = createServer();
		request = supertest(httpServer);
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	beforeEach(async () => {
		await db.todoTask.deleteMany();
		({ id: listId } = await db.todoList.create({
			data: mockTodoList,
		}));
		mockTodoTask.listId = listId;

		ioSpies = { emit: jest.fn(), joinRoom: jest.fn(), leaveRoom: jest.fn() };
		jest.spyOn(ioMiddleware, 'io').mockReturnValue(ioSpies as any);
	});

	afterEach(async () => {
		await db.todoTask.deleteMany();
		await db.todoList.deleteMany();
	});

	describe('getTasksByListId', () => {
		it('return tasks', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });
			const { id: id2 } = await db.todoTask.create({ data: mockTodoTask });

			const response = await request.get(`/api/todo-lists/${listId}/tasks`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ ...mockTodoTask, id }),
					expect.objectContaining({ ...mockTodoTask, id: id2 }),
				]),
			);
		});

		it('return tasks with projection', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });
			const { id: id2 } = await db.todoTask.create({ data: mockTodoTask });

			const response = await request
				.get(`/api/todo-lists/${listId}/tasks`)
				.query({ include: ['name'] });

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name: mockTodoTask.name, id }),
					expect.objectContaining({ name: mockTodoTask.name, id: id2 }),
				]),
			);
		});

		it('return empty array', async () => {
			await db.todoTask.create({ data: mockTodoTask });

			const response = await request.get(`/api/todo-lists/123/tasks`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual([]);
		});

		it('assert params', async () => {
			const response = await request.get(`/api/todo-lists/test/tasks`);

			expect(response.status).toBe(400);
			expect(JSON.parse(response.text).error.title).toMatch(
				/Params validation error: .*listId.*number.*/s,
			);
		});
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
			expect(JSON.parse(response.text).error.title).toMatch(
				/Params validation error: .*taskId.*number.*/s,
			);
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
					.send({ ['name']: '' });

				expect(response.status).toBe(400);
				expect(JSON.parse(response.text).error.title).toMatch(
					/Body validation error: .*too_small.*name.*/s,
				);
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
			it(`assert name`, async () => {
				const response = await request
					.patch(`/api/todo-lists/${listId}/tasks/12`)
					.send({ ...mockTodoTask, name: '' });

				expect(response.status).toBe(400);
				expect(JSON.parse(response.text).error.title).toMatch(
					/Body validation error: .*too_small.*name.*/s,
				);
			});

			it(`assert description`, async () => {
				const response = await request
					.patch(`/api/todo-lists/${listId}/tasks/12`)
					.send({ ...mockTodoTask, description: 123 });

				expect(response.status).toBe(400);
				expect(JSON.parse(response.text).error.title).toMatch(
					/Body validation error: .*description.*Expected string, received number.*/s,
				);
			});
		});
	});

	describe('deleteTaskById', () => {
		it('delete task', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });

			const response = await request.delete(`/api/todo-lists/${listId}/tasks/${id}`);

			const data = await db.todoTask.findFirst();

			expect(response.status).toBe(204);
			expect(data).toEqual(null);
			expect(ioSpies.emit).toHaveBeenCalledWith({
				room: getTodoListRoom(listId),
				event: todoTaskDeletedEvent,
				data: { listId, taskId: id },
			});
		});

		it('abort transaction if list update fails', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });

			const response = await request.delete(`/api/todo-lists/123/tasks/${id}`);

			const task = await db.todoTask.findFirst();
			const list = await db.todoList.findFirst();

			expect(response.status).toBe(500);
			expect(task).not.toEqual(null);
			expect(list).toEqual(expect.objectContaining(mockTodoList));
			expect(ioSpies.emit).not.toHaveBeenCalled();
		});
	});
});
