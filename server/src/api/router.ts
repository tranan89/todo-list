import Router from '@koa/router';

import * as todoTask from './todoTask.js';

const router = new Router({
	prefix: '/api',
});

router
	// .get('/contacts', todoTask.getContracts)
	.get('/todo-tasks/:id', todoTask.getTaskById)
	.post('/todo-tasks', todoTask.createTask);

export default router;
