import { TodoList, TodoTask } from './index.js';

export type TodoListMock = Omit<TodoList, 'id' | 'createdAt' | 'updatedAt'>;
export type TodoTaskMock = Omit<TodoTask, 'id' | 'createdAt' | 'updatedAt'>;
