import React, { useCallback, useState, useEffect } from 'react';
import { TodoTask, TodoList } from '../types';
import styles from './styles.css';
import AddTask from './AddTask/AddTask';
import EditTask from './EditTask/EditTask';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import { useApiClient } from '../../../contexts/apiClient';
import { useSocket } from '../../../contexts/socket';

interface Props {
	selectedList: TodoList;
}
interface SocketEvent {
	listId: TodoList['id'];
	taskId: TodoTask['id'];
}

const Tasks = (props: Props) => {
	const { selectedList } = props;

	const [roomJoined, setRoomJoined] = useState<boolean>(false);
	const [taskRecord, setTaskRecord] = useState<Record<TodoTask['id'], TodoTask>>({});
	const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>();

	const { apiClient } = useApiClient();
	const { socket, onConnect, onDisconnect, onEvent } = useSocket();

	const getTasks = useCallback(async () => {
		setTaskRecord({});

		const { data } = (await apiClient.get(`/api/todo-lists/${selectedList.id}/tasks`)).data;

		const taskRecord = data.reduce((acc: Record<TodoTask['id'], TodoTask>, task: TodoTask) => {
			acc[task.id] = task;
			return acc;
		}, {});

		setTaskRecord(taskRecord);
	}, [apiClient, selectedList]);

	const getTask = useCallback(
		async (taskId: TodoTask['id']) => {
			const { data } = (await apiClient.get(`/api/todo-lists/${selectedList.id}/tasks/${taskId}`))
				.data;

			setTaskRecord((prevTaskRecord) => {
				return {
					...prevTaskRecord,
					[data.id]: data,
				};
			});
		},
		[apiClient],
	);

	const deleteTask = useCallback(
		async (taskId: TodoTask['id']) => {
			await apiClient.delete(`/api/todo-lists/${selectedList.id}/tasks/${taskId}`);
		},
		[apiClient],
	);

	useEffect(() => {
		getTasks();
	}, []);

	const joinSocketRoom = useCallback(async () => {
		if (roomJoined) {
			return;
		}
		await apiClient.post(`/api/todo-lists/${selectedList.id}/join-room`, { socketId: socket.id });

		setRoomJoined(true);
	}, [apiClient, socket, roomJoined, setRoomJoined, selectedList.id]);

	const removeTask = useCallback(
		(taskId: TodoTask['id']) => {
			delete taskRecord[taskId];
			setTaskRecord({ ...taskRecord });
		},
		[setTaskRecord, taskRecord],
	);

	useEffect(() => {
		onConnect(`list.${selectedList.id}.tasks`, () => {
			joinSocketRoom();
		});
		onDisconnect(`list.${selectedList.id}.tasks`, () => {
			setRoomJoined(false);
		});
		onEvent(
			'todoTaskCreated',
			`list.${selectedList.id}.tasks.todoTaskCreated`,
			({ listId, taskId }: SocketEvent) => {
				if (listId === selectedList.id) {
					getTask(taskId);
				}
			},
		);
		onEvent(
			'todoTaskUpdated',
			`list.${selectedList.id}.tasks.todoTaskUpdated`,
			({ listId, taskId }: SocketEvent) => {
				if (listId === selectedList.id) {
					getTask(taskId);
				}
			},
		);
		onEvent(
			'todoTaskDeleted',
			`list.${selectedList.id}.tasks.todoTaskDeleted`,
			({ listId, taskId }: SocketEvent) => {
				if (listId === selectedList.id) {
					removeTask(taskId);
				}
			},
		);
	}, [
		socket,
		onConnect,
		onDisconnect,
		onEvent,
		joinSocketRoom,
		getTask,
		selectedList.id,
		removeTask,
	]);

	return (
		<>
			<div className={styles.tasksPanel}>
				<AddTask listId={selectedList.id} />
				<ul>
					{selectedList.taskIds.map((taskId: TodoTask['id']) => {
						const task = taskRecord[taskId];

						if (!task) {
							return null;
						}
						const className = task.id === selectedTaskId ? styles.selectedTask : styles.task;

						return (
							<li className={className} onClick={() => setSelectedTaskId(task.id)} key={task.id}>
								<p>{task.name}</p>
								<DeleteIcon
									onClick={async (e) => {
										e.stopPropagation();

										if (selectedTaskId === task.id) {
											setSelectedTaskId(undefined);
										}
										await deleteTask(task.id);
									}}
								/>
							</li>
						);
					})}
				</ul>
			</div>
			{selectedTaskId && (
				<div className={styles.editTaskPanel}>
					<EditTask
						key={selectedTaskId}
						task={taskRecord[selectedTaskId]}
						listId={selectedList.id}
					/>
				</div>
			)}
		</>
	);
};

export default Tasks;
