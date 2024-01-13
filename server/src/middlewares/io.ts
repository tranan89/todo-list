import type { Context, Next } from 'koa';
import type { Server } from 'socket.io';

export interface IoContext {
	io: {
		emit: ({ room, event, data }: { room: string; event: string; data: any }) => void;
		joinRoom: ({ room, socketId }: { room: string; socketId: string }) => void;
		leaveRoom: ({ room, socketId }: { room: string; socketId: string }) => void;
	};
}

export const io = ({ ioServer }: { ioServer: Server }): IoContext['io'] => {
	return {
		emit: ({ room, event, data }) => {
			ioServer.to(room).emit(event, data);
		},
		joinRoom: ({ room, socketId }) => {
			ioServer.to(socketId).socketsJoin(room);
		},
		leaveRoom: ({ room, socketId }) => {
			ioServer.to(socketId).socketsLeave(room);
		},
	};
};

const ioMiddleware =
	({ ioServer }: { ioServer: Server }) =>
	(ctx: Context, next: Next) => {
		Object.defineProperty(ctx, 'io', {
			get() {
				return io({ ioServer });
			},
			enumerable: true,
		});
		return next();
	};

export default ioMiddleware;
