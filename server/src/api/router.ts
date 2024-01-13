import Router from '@koa/router';

import * as todoTask from './todoTask.js';
import * as todoList from './todoList.js';

const router = new Router({
	prefix: '/api/todo-lists',
});

router
	.get('/:listId', todoList.getListById)
	.patch('/:listId', todoList.updateListById)
	.post('/', todoList.createList)
	.post('/:listId/join-room', todoList.joinListRoom)

	.get('/:listId/tasks/:taskId', todoTask.getTaskById)
	.patch('/:listId/tasks/:taskId', todoTask.updateTaskById)
	.post('/:listId/tasks', todoTask.createTask);

export default router;
