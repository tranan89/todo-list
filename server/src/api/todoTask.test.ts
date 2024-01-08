import { expect, it, describe, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent.js';
import { IncomingMessage, ServerResponse } from 'http';
import createHttpServer from '../createHttpServer.js';
import db from '../database.js';
import { TodoTask } from '../types/index.js';

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

describe('todo-task', () => {
	let app: RequestListener;
	let request: TestAgent<Test>;
	const mockTodoTask: TodoTask = {
		name: 'Employment Agreement',
		description: 'HR',
	};

	beforeAll((): void => {
		app = createHttpServer().callback();
		request = supertest(app);
	});

	afterAll(async (): Promise<void> => {
		await db.$disconnect();
	});

	beforeEach(async (): Promise<void> => {
		await db.todoTask.deleteMany();
	});

	afterEach(async (): Promise<void> => {
		await db.todoTask.deleteMany();
	});

	describe('getTaskById', () => {
		it('return task', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });
			const response = await request.get(`/api/todo-tasks/${id}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(expect.objectContaining(mockTodoTask));
		});

		it('return task with projection', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });
			const response = await request.get(`/api/todo-tasks/${id}`).query({ include: ['name'] });

			console.info(response);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual({
				name: mockTodoTask.name,
				id,
			});
		});

		it('return null', async () => {
			const response = await request.get(`/api/todo-tasks/123`);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(null);
		});

		it('assert params', async () => {
			const response = await request.get(`/api/todo-tasks/test`);

			expect(response.status).toBe(400);
			expect(response.text).toEqual('Params validation error: "id" must be a number');
		});

		it('assert query', async () => {
			const response = await request.get(`/api/todo-tasks/123?foo=bar`);

			expect(response.status).toBe(400);
			expect(response.text).toEqual('Query validation error: "foo" is not allowed');
		});
	});

	describe('createTask', () => {
		const mockTodoTask = {
			name: 'Employment Agreement',
		};

		it('create task', async () => {
			const response = await request.post(`/api/todo-tasks`).send(mockTodoTask);

			const data = await db.todoTask.findFirst();

			expect(response.status).toBe(200);
			expect(data).toEqual(expect.objectContaining({ ...mockTodoTask, id: response.body.data.id }));
		});

		describe('assert body', () => {
			it(`assert name`, async () => {
				const response = await request.post(`/api/todo-tasks`).send({ ['name']: undefined });

				expect(response.status).toBe(400);
				expect(response.text).toEqual(`Body validation error: "name" is required`);
			});
		});
	});

	describe('updateTask', () => {
		it('update task name and description', async () => {
			const { id } = await db.todoTask.create({ data: mockTodoTask });

			const updatedTask = {
				name: 'Grocery Shopping',
				description: 'Milk, Eggs, Bread',
			};

			const response = await request.patch(`/api/todo-tasks/${id}`).send(updatedTask);

			const data = await db.todoTask.findFirst();

			expect(response.status).toBe(200);
			expect(data).toEqual(expect.objectContaining({ ...updatedTask, id }));
		});

		describe('assert body', () => {
			Object.keys(mockTodoTask).forEach((key: string) => {
				it(`assert ${key}`, async () => {
					const response = await request
						.patch(`/api/todo-tasks/12`)
						.send({ ...mockTodoTask, [key]: undefined });

					expect(response.status).toBe(400);
					expect(response.text).toEqual(`Body validation error: "${key}" is required`);
				});
			});
		});
	});
});
