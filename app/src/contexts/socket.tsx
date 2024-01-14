import { createContext, useContext } from 'react';
import getSocket from '../utils/socket';

export const SocketContext = createContext<ReturnType<typeof getSocket> | null>(null);

export const useSocket = () => {
	const socketContext = useContext(SocketContext);

	if (!socketContext) {
		throw new Error('useSocket has to be used within <SocketContext.Provider>');
	}

	return socketContext;
};
