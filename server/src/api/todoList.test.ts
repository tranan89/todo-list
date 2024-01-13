import { expect, it, describe, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent.js';
import { type Server } from 'http';
import createHttpServer from '../createHttpServer.js';
import db from '../database.js';
import { TodoListMock } from '../types/tests.js';
import * as ioMiddleware from '../middlewares/io.js';
import { getTodoListRoom, todoListUpdatedEvent } from './constants/socket.js';

describe('todo-list', () => {
	let app: Server;
	let request: TestAgent<Test>;
	let ioSpies: { emit: jest.SpyInstance; joinRoom: jest.SpyInstance; leaveRoom: jest.SpyInstance };
	const mockTodoList: TodoListMock = {
		name: 'Employment Agreement',
		taskIds: [1, 2, 3],
	};

	beforeAll((): void => {
		app = createHttpServer();
		request = supertest(app);
	});

	afterAll(async (): Promise<void> => {
		await db.$disconnect();
	});

	beforeEach(async (): Promise<void> => {
		await db.todoList.deleteMany();

		ioSpies = { emit: jest.fn(), joinRoom: jest.fn(), leaveRoom: jest.fn() };
		jest.spyOn(ioMiddleware, 'io').mockReturnValue(ioSpies as any);
	});

	afterEach(async (): Promise<void> => {
		await db.todoList.deleteMany();
	});

	describe('getLists', () => {
		it('return lists', async () => {
			const [{ id }, { id: id2 }] = await Promise.all([
				db.todoList.create({
					data: mockTodoList,
				}),
				db.todoList.create({
					data: mockTodoList,
				}),
			]);

			const response = await request.get(`/api/todo-lists`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual([
				expect.objectContaining({ ...mockTodoList, id }),
				expect.objectContaining({ ...mockTodoList, id: id2 }),
			]);
		});

		it('return lists with projection', async () => {
			const name = 'foo';
			const name2 = 'bar';

			const [{ id }, { id: id2 }] = await Promise.all([
				db.todoList.create({
					data: { ...mockTodoList, name },
				}),
				db.todoList.create({
					data: { ...mockTodoList, name: name2 },
				}),
			]);

			const response = await request.get(`/api/todo-lists`).query({ include: ['name'] });

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ name, id }),
					expect.objectContaining({ name: name2, id: id2 }),
				]),
			);
		});

		it('return null', async () => {
			const response = await request.get(`/api/todo-lists`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual([]);
		});

		it('assert query', async () => {
			const response = await request.get(`/api/todo-lists?foo=bar`);

			expect(response.status).toBe(400);
			expect(response.text).toEqual('Query validation error: "foo" is not allowed');
		});
	});

	describe('getListById', () => {
		it('return list', async () => {
			const { id } = await db.todoList.create({ data: mockTodoList });
			const response = await request.get(`/api/todo-lists/${id}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(expect.objectContaining(mockTodoList));
		});

		it('return list with projection', async () => {
			const { id } = await db.todoList.create({ data: mockTodoList });
			const response = await request.get(`/api/todo-lists/${id}`).query({ include: ['name'] });

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual({
				name: mockTodoList.name,
				id,
			});
		});

		it('return null', async () => {
			const response = await request.get(`/api/todo-lists/123`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(null);
		});

		it('assert params', async () => {
			const response = await request.get(`/api/todo-lists/test`);

			expect(response.status).toBe(400);
			expect(response.text).toEqual('Params validation error: "listId" must be a number');
		});

		it('assert query', async () => {
			const response = await request.get(`/api/todo-lists/123?foo=bar`);

			expect(response.status).toBe(400);
			expect(response.text).toEqual('Query validation error: "foo" is not allowed');
		});
	});

	describe('createList', () => {
		const mockTodoList = {
			name: 'Employment Agreement',
		};

		it('create list', async () => {
			const response = await request.post(`/api/todo-lists`).send(mockTodoList);

			const data = await db.todoList.findFirst();

			expect(response.status).toBe(200);
			expect(data).toEqual(
				expect.objectContaining({ ...mockTodoList, id: response.body.data.listId }),
			);
		});

		describe('assert body', () => {
			it(`assert name`, async () => {
				const response = await request.post(`/api/todo-lists`).send({ ['name']: undefined });

				expect(response.status).toBe(400);
				expect(response.text).toEqual(`Body validation error: "name" is required`);
			});
		});
	});

	describe('updateList', () => {
		it('update list name and taskIds', async () => {
			const { id: listId } = await db.todoList.create({ data: mockTodoList });

			const updatedList = {
				name: 'Grocery Shopping',
				taskIds: [4, 3, 2, 1],
			};

			const response = await request.patch(`/api/todo-lists/${listId}`).send(updatedList);

			const data = await db.todoList.findFirst();

			expect(response.status).toBe(204);
			expect(data).toEqual(expect.objectContaining({ ...updatedList, id: listId }));
			expect(ioSpies.emit).toHaveBeenCalledWith({
				room: getTodoListRoom(listId),
				event: todoListUpdatedEvent,
				data: { listId },
			});
		});

		it(`assert at least 1 payload key`, async () => {
			const response = await request.patch(`/api/todo-lists/12`).send({});

			expect(response.status).toBe(400);
			expect(response.text).toEqual(`Body validation error: "value" must have at least 1 key`);
		});
	});

	describe('joinListRoom', () => {
		it('update list name and taskIds', async () => {
			const listId = 123;
			const socketId = '123';

			const response = await request.post(`/api/todo-lists/${listId}/join-room`).send({ socketId });

			expect(response.status).toBe(204);
			expect(ioSpies.joinRoom).toHaveBeenCalledWith({
				socketId,
				room: getTodoListRoom(listId),
			});
		});

		it(`assert socketId payload`, async () => {
			const response = await request.post(`/api/todo-lists/12/join-room`).send({});

			expect(response.status).toBe(400);
			expect(response.text).toEqual(`Body validation error: "socketId" is required`);
		});
	});
});
