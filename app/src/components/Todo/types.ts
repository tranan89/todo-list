export interface TodoTask {
	id: number;
	name: string;
	description?: string;
}

export interface TodoList {
	id: number;
	name: string;
	description?: string;
	taskIds: number[];
}
