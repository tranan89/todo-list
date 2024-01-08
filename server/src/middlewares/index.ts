import compose from 'koa-compose';
import bodyParser from 'koa-body';
import validateMiddleware from './validate.js';

export default compose([
	bodyParser(),
	validateMiddleware(),
	// TODO: add header parser, logger, error handler, metrics etc
]);
