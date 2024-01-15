import React, { useCallback, useState, useEffect, useRef } from 'react';
import indexOf from 'lodash/indexOf';
import clsx from 'clsx';
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
	const [taskIds, setTaskIds] = useState<TodoList['taskIds']>(props.selectedList.taskIds);
	const [draggedTaskId, setDraggedTaskId] = useState<TodoTask['id'] | undefined>();

	const { apiClient } = useApiClient();
	const { socket, onConnect, onDisconnect, onEvent } = useSocket();

	const dragOverItem = useRef('');

	useEffect(() => {
		setTaskIds(props.selectedList.taskIds);
	}, [selectedList.taskIds]);

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

	const updateTaskOrderInList = useCallback(
		async (taskIds: TodoList['taskIds']) => {
			await apiClient.patch(`/api/todo-lists/${selectedList.id}`, { taskIds });
		},
		[selectedList.id],
	);

	const updateTaskOrder = useCallback(async () => {
		if (!draggedTaskId) return;

		const taskIds = [...selectedList.taskIds];

		const dragIndex = indexOf(taskIds, draggedTaskId);
		const dragOverIndex = indexOf(taskIds, Number(dragOverItem.current));

		taskIds.splice(dragIndex, 1);
		taskIds.splice(dragOverIndex, 0, draggedTaskId);

		setTaskIds(taskIds);
		setDraggedTaskId(undefined);

		await updateTaskOrderInList(taskIds);
	}, [selectedList.taskIds, draggedTaskId, dragOverItem, setTaskIds, updateTaskOrderInList]);

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
					{taskIds.map((taskId: TodoTask['id']) => {
						const task = taskRecord[taskId];

						if (!task) {
							return null;
						}

						return (
							<li
								id={task.id.toString()}
								className={clsx({
									[styles.task]: true,
									[styles.selectedTask]: task.id === selectedTaskId,
								})}
								onClick={() => setSelectedTaskId(task.id)}
								key={task.id}
								draggable
								onDragStart={() => {
									setDraggedTaskId(task.id);
								}}
								onDragOver={(e) => {
									dragOverItem.current = e.currentTarget.id;
								}}
								onDragEnd={updateTaskOrder}
							>
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
