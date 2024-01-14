import type { DefaultContext } from 'koa';
import type { IoContext } from '../middlewares/io.js';

export type TodoTask = {
	id: number;
	listId: number;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
};

export type TodoList = {
	id: number;
	name: string;
	taskIds: number[];
	createdAt: Date;
	updatedAt: Date;
};

export interface Context extends DefaultContext, IoContext {}
