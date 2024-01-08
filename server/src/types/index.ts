import type { DefaultContext } from 'koa';

export type TodoTask = {
	name: string;
	description?: string;
};

export type TodoList = {
	name: string;
	taskIds?: number[];
};

interface ValidateContext {
	parsedParams: {
		id?: number;
	};
	parsedQuery: {
		include?: string[];
	};
}

export interface Context extends DefaultContext, ValidateContext {}
