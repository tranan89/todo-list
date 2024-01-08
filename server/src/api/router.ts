import Router from '@koa/router';

import * as todoTask from './todoTask.js';

const router = new Router({
	prefix: '/api',
});

router
	.get('/todo-tasks/:id', todoTask.getTaskById)
	.patch('/todo-tasks/:id', todoTask.updateTaskById)
	.post('/todo-tasks', todoTask.createTask);

export default router;
