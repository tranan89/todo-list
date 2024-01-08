import { expect, it, describe, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent.js';
import { IncomingMessage, ServerResponse } from 'http';
import createHttpServer from '../createHttpServer.js';
import db from '../database.js';
import { TodoList } from '../types/index.js';

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

describe('todo-list', () => {
	let app: RequestListener;
	let request: TestAgent<Test>;
	const mockTodoList: TodoList = {
		name: 'Employment Agreement',
		taskIds: [1, 2, 3],
	};

	beforeAll((): void => {
		app = createHttpServer().callback();
		request = supertest(app);
	});

	afterAll(async (): Promise<void> => {
		await db.$disconnect();
	});

	beforeEach(async (): Promise<void> => {
		await db.todoList.deleteMany();
	});

	afterEach(async (): Promise<void> => {
		await db.todoList.deleteMany();
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

			console.info(response);

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
			expect(response.text).toEqual('Params validation error: "id" must be a number');
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
			expect(data).toEqual(expect.objectContaining({ ...mockTodoList, id: response.body.data.id }));
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
		it('update list name and description', async () => {
			const { id } = await db.todoList.create({ data: mockTodoList });

			const updatedList = {
				name: 'Grocery Shopping',
				taskIds: [4, 3, 2, 1],
			};

			const response = await request.patch(`/api/todo-lists/${id}`).send(updatedList);

			const data = await db.todoList.findFirst();

			expect(response.status).toBe(200);
			expect(data).toEqual(expect.objectContaining({ ...updatedList, id }));
		});

		it(`assert at least 1 payload key`, async () => {
			const response = await request.patch(`/api/todo-lists/12`).send({});

			expect(response.status).toBe(400);
			expect(response.text).toEqual(`Body validation error: "value" must have at least 1 key`);
		});
	});
});
