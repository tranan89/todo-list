import Router from '@koa/router';

import * as todoTask from './todoTask.js';
import * as todoList from './todoList.js';

const router = new Router({
	prefix: '/api',
});

router
	.get('/todo-tasks/:id', todoTask.getTaskById)
	.patch('/todo-tasks/:id', todoTask.updateTaskById)
	.post('/todo-tasks', todoTask.createTask)

	.get('/todo-lists/:id', todoList.getListById)
	.patch('/todo-lists/:id', todoList.updateListById)
	.post('/todo-lists', todoList.createList);

export default router;
