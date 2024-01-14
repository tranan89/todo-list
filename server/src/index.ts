import envConfigs from './loadEnv.js';
import createServer from './createServer.js';
import db from './database.js';

const port: string | 3000 = process.env.PORT || 3000;
const { httpServer, ioServer } = createServer();
const controller: AbortController = new AbortController();
const name = 'assignment';

db.$connect();

httpServer.listen(
	{
		host: 'localhost',
		port: port,
		signal: controller.signal,
	},
	(): void => {
		console.info(`Started ${name}@${process.env.IMAGE_TAG} on port: ${port}`);
	},
);

['SIGTERM', 'SIGINT'].forEach((signal) =>
	process.on(signal, async (): Promise<void> => {
		try {
			console.info(`Received ${signal}, begin graceful shutdown`);
			ioServer.close();
			console.info('Closed socket server');
			controller.abort();
			console.info('Closed http server');
			await db.$disconnect();
			console.info('Disconnected db');
		} catch (error) {
			if (error instanceof Error) {
				error.message = `graceful shutdown error: ${error.message}`;
				console.error(error);
			} else {
				console.error(`graceful shutdown error: ${String(error)}`);
			}
		}
	}),
);
