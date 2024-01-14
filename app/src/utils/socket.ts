import { io } from 'socket.io-client';

type SocketType = {
	onConnect: (key: string, cb: Function) => void;
	onDisconnect: (key: string, cb: Function) => void;
	onEvent: (event: string, key: string, cb: Function) => void;
	socket: ReturnType<typeof io>;
};

const getSocket = (): SocketType => {
	const onConnectListeners = {} as Record<string, Function>;
	const onDisconnectListeners = {} as Record<string, Function>;
	const onEventListeners = {} as Record<string, Function>;

	const socket = io('http://localhost:3000');

	socket.io.on('reconnect_attempt', (attempt) => {
		console.log(`socket reconnect attempt ${attempt}`);
	});

	socket.io.on('reconnect', (attempts) => {
		console.log(`socket reconnected after ${attempts} attempts`);
	});

	socket.io.on('error', (error) => {
		error.message = `socket connect_error: ${error.message}`;
		console.error(error);
	});

	socket.on('connect', () => {
		console.log('socket connected');

		Object.values(onConnectListeners).forEach((onConnectCallback) => {
			onConnectCallback();
		});
	});

	socket.on('disconnect', (reason) => {
		if (reason === 'io server disconnect') {
			// Explicit disconnection by the server.
			// There will be no automatic reconnect attempt so we reconnect manually.
			// See: https://socket.io/docs/v4/client-api/#Event-%E2%80%98disconnect%E2%80%99
			socket.connect();
		}

		Object.values(onDisconnectListeners).forEach((onDisconnectCallback) => {
			onDisconnectCallback();
		});
	});

	const onConnect = (key: string, cb: Function) => {
		onConnectListeners[key] = cb;

		if (socket.connected) {
			cb();
		}
	};
	const onDisconnect = (key: string, cb: Function) => {
		onDisconnectListeners[key] = cb;
	};

	const onEvent = (event: string, key: string, cb: Function) => {
		onEventListeners[key] = cb;

		if (!socket.hasListeners(event)) {
			socket.on(event, (data) => {
				Object.values(onEventListeners).forEach((onEventCallback) => {
					onEventCallback(data);
				});
			});
		}
	};

	return {
		onConnect,
		onDisconnect,
		onEvent,
		socket,
	};
};

export default getSocket;
