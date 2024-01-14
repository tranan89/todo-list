import Router from '@koa/router';

import * as todoTask from './todoTask.js';
import * as todoList from './todoList.js';

const router = new Router({
	prefix: '/api/todo-lists',
});

router
	.get('/', todoList.getLists)
	.post('/', todoList.createList)
	.get('/:listId', todoList.getListById)
	.patch('/:listId', todoList.updateListById)
	.post('/:listId/join-room', todoList.joinListRoom)

	.get('/:listId/tasks', todoTask.getTasksByListId)
	.get('/:listId/tasks/:taskId', todoTask.getTaskById)
	.patch('/:listId/tasks/:taskId', todoTask.updateTaskById)
	.delete('/:listId/tasks/:taskId', todoTask.deleteTaskById)
	.post('/:listId/tasks', todoTask.createTask);

export default router;
