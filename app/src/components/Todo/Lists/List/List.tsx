import React, { useState, useCallback, useEffect } from 'react';
import { TodoList } from '../../types';
import { useApiClient } from '../../../../contexts/apiClient';
import { useSocket } from '../../../../contexts/socket';
import EditIcon from '../../../../components/icons/EditIcon';
import PrimaryButton from '../../../../components/buttons/PrimaryButton/PrimaryButton';
import DefaultButton from '../../../../components/buttons/DefaultButton/DefaultButton';
import TextInput from '../../../../components/inputs/TextInput/TextInput';
import styles from './styles.css';

interface Props extends TodoList {
	onClick: () => void;
	selectedListId?: TodoList['id'];
	updateList: (list: TodoList) => void;
}
interface SocketEvent {
	listId: TodoList['id'];
}

const List = (props: Props) => {
	const { onClick, selectedListId, id, updateList } = props;

	const [roomJoined, setRoomJoined] = useState<boolean>(false);
	const [edit, setEdit] = useState<boolean>(false);
	const [name, setName] = useState<string>(props.name);

	const { apiClient } = useApiClient();
	const { socket, onConnect, onDisconnect, onEvent } = useSocket();

	useEffect(() => {
		setName(props.name);
	}, [props.name]);

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
		onConnect(`list.${id}`, async () => {
			await joinSocketRoom();
		});
		onDisconnect(`list.${id}`, () => {
			setRoomJoined(false);
		});
		onEvent('todoTaskCreated', `list.${id}.todoTaskCreated`, async ({ listId }: SocketEvent) => {
			if (listId === id) {
				await getUpdatedList();
			}
		});
		onEvent('todoListUpdated', `list.${id}.todoListUpdated`, async ({ listId }: SocketEvent) => {
			if (listId === id) {
				await getUpdatedList();
			}
		});
	}, [socket, onConnect, onDisconnect, onEvent, joinSocketRoom, id, getUpdatedList]);

	const updateListName = useCallback(async () => {
		await apiClient.patch(`/api/todo-lists/${id}`, { name });
	}, [apiClient, id, name]);

	const className = id === selectedListId ? styles.selectedList : styles.list;

	return (
		<li
			className={className}
			onClick={() => {
				if (!edit) {
					onClick();
				}
			}}
		>
			{edit ? (
				<form
					className={styles.editForm}
					onSubmit={async (e) => {
						e.stopPropagation();
						e.preventDefault();
						await updateListName();
						setEdit(false);
					}}
				>
					<TextInput
						value={name}
						onChange={(e) => {
							setName(e.target.value);
						}}
					/>
					<div className={styles.buttonGroup}>
						<DefaultButton
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setEdit(false);
							}}
						>
							Cancel
						</DefaultButton>
						<PrimaryButton type="submit">Save</PrimaryButton>
					</div>
				</form>
			) : (
				<>
					<p>{name}</p>
					<EditIcon
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setEdit(true);
						}}
					/>
				</>
			)}
		</li>
	);
};

export default List;
