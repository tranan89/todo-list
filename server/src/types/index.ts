import type { DefaultContext } from 'koa';

export type TodoTask = {
	name: string;
	description: string;
};

interface ValidateContext {
	parsedQuery: {
		include?: string[];
	};
	parsedRequestBody: {
		name: string;
		description: string;
	};
}

export interface Context extends DefaultContext, ValidateContext {}
