import React, { useState, useCallback, useEffect } from 'react';
import { TodoList } from '../../types';
import { useApiClient } from '../../../../contexts/apiClient';
import { useSocket } from '../../../../contexts/socket';
import styles from './styles.css';

interface Props extends TodoList {
	onClick: () => void;
	selectedListId?: TodoList['id'];
	updateList: (list: TodoList) => void;
}

const List = (props: Props) => {
	const { onClick, selectedListId, name, id, updateList } = props;

	const [roomJoined, setRoomJoined] = useState<boolean>(false);

	const { apiClient } = useApiClient();
	const { socket, onConnect, onDisconnect, onEvent } = useSocket();

	const joinSocketRoom = useCallback(async () => {
		if (roomJoined) {
			return;
		}
		await apiClient.post(`/api/todo-lists/${id}/join-room`, { socketId: socket.id });

		setRoomJoined(true);
	}, [apiClient, socket, roomJoined, setRoomJoined]);

	const getUpdatedList = useCallback(async () => {
		const { data } = (await apiClient.get(`/api/todo-lists/${id}`)).data;
		updateList(data);
	}, [apiClient, id, updateList]);

	useEffect(() => {
		onConnect(`list.${id}`, () => {
			joinSocketRoom();
		});
		onDisconnect(`list.${id}`, () => {
			setRoomJoined(false);
		});
		onEvent(
			'todoTaskCreated',
			`list.${id}.todoTaskCreated`,
			({ listId }: { listId: TodoList['id'] }) => {
				if (listId === id) {
					getUpdatedList();
				}
			},
		);
	}, [socket, onConnect, onDisconnect, onEvent, joinSocketRoom, id, getUpdatedList]);

	const className = id === selectedListId ? styles.selectedList : styles.list;

	return (
		<li className={className} onClick={onClick}>
			<p>{name}</p>
		</li>
	);
};

export default List;
