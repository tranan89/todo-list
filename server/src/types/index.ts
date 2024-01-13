import type { DefaultContext } from 'koa';
import type { ValidateContext } from '../middlewares/validate.js';
import type { IoContext } from '../middlewares/io.js';

export type TodoTask = {
	id: number;
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

export interface Context extends DefaultContext, ValidateContext, IoContext {}
