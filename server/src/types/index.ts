import type { DefaultContext } from 'koa';
import type { ValidateContext } from '../middlewares/validate.js';
import type { IoContext } from '../middlewares/io.js';

export type TodoTask = {
	name: string;
	description?: string;
};

export type TodoList = {
	name: string;
	taskIds?: number[];
};

export interface Context extends DefaultContext, ValidateContext, IoContext {}
