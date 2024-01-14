import React, { useCallback, useState, useEffect } from 'react';
import { TodoTask, TodoList } from '../types';
import styles from './styles.css';
import AddTask from './AddTask/AddTask';
import EditTask from './EditTask/EditTask';
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
	const [selectedTask, setSelectedTask] = useState<TodoTask>();

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
			`list.${selectedList.id}.tasks.todoTaskCreated`,
			({ listId, taskId }: SocketEvent) => {
				if (listId === selectedList.id) {
					getTask(taskId);
				}
			},
		);
	}, [socket, onConnect, onDisconnect, onEvent, joinSocketRoom, getTask, selectedList.id]);

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
						const className = task.id === selectedTask?.id ? styles.selectedTask : styles.task;

						return (
							<li className={className} onClick={() => setSelectedTask(task)} key={task.id}>
								<p>{task.name}</p>
							</li>
						);
					})}
				</ul>
			</div>
			{selectedTask && (
				<div className={styles.editTaskPanel}>
					<EditTask key={selectedTask.id} task={selectedTask} listId={selectedList.id} />
				</div>
			)}
		</>
	);
};

export default Tasks;
