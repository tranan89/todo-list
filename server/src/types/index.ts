import type { DefaultContext } from 'koa';

export type TodoTask = {
	name: string;
	description: string;
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
