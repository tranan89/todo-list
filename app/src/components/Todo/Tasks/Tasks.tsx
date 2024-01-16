import React, { useCallback, useState, useEffect, Fragment } from 'react';
import indexOf from 'lodash/indexOf';
import clsx from 'clsx';
import { TodoTask, TodoList } from '../types';
import styles from './styles.css';
import AddTask from './AddTask/AddTask';
import EditTask from './EditTask/EditTask';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import DefaultButton from '../../../components/buttons/DefaultButton/DefaultButton';
import { useApiClient } from '../../../contexts/apiClient';
import { useSocket } from '../../../contexts/socket';

interface Props {
	selectedList: TodoList;
	goBack: () => void;
}
interface SocketEvent {
	listId: TodoList['id'];
	taskId: TodoTask['id'];
}

const Tasks = (props: Props) => {
	const { selectedList, goBack } = props;

	const [taskRecord, setTaskRecord] = useState<Record<TodoTask['id'], TodoTask>>({});
	const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>();
	const [taskIds, setTaskIds] = useState<TodoList['taskIds']>(props.selectedList.taskIds);
	const [draggedTaskId, setDraggedTaskId] = useState<TodoTask['id'] | undefined>();
	const [draggedOverTaskId, setDraggedOverTaskId] = useState<TodoTask['id'] | undefined>();
	const [editing, setEditing] = useState<boolean>(false);
	const [disconnected, setDisconnected] = useState<boolean>(false);

	const dragIndex = draggedTaskId ? indexOf(taskIds, draggedTaskId) : -1;
	const dragOverIndex = draggedOverTaskId ? indexOf(taskIds, draggedOverTaskId) : -1;

	const { apiClient } = useApiClient();
	const { socket, onEvent, onConnect, onDisconnect } = useSocket();

	useEffect(() => {
		if (!editing) {
			setTaskIds(props.selectedList.taskIds);
		}
	}, [selectedList.taskIds, editing]);

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

	const removeTask = useCallback(
		(taskId: TodoTask['id']) => {
			delete taskRecord[taskId];
			setTaskRecord({ ...taskRecord });
		},
		[setTaskRecord, taskRecord],
	);

	const updateTaskOrderInList = useCallback(
		async (taskIds: TodoTask['id'][]) => {
			await apiClient.patch(`/api/todo-lists/${selectedList.id}`, { taskIds });
			setEditing(false);
		},
		[selectedList.id, setEditing, taskIds],
	);

	const updateTaskOrder = useCallback(async () => {
		if (!draggedTaskId) return;

		const updatedTaskIds = [...taskIds];

		updatedTaskIds.splice(dragIndex, 1);
		updatedTaskIds.splice(dragOverIndex, 0, draggedTaskId);

		setTaskIds(updatedTaskIds);
		setDraggedTaskId(undefined);
		setDraggedOverTaskId(undefined);
		setEditing(true);

		await updateTaskOrderInList(updatedTaskIds);
	}, [
		selectedList.taskIds,
		draggedTaskId,
		draggedOverTaskId,
		setTaskIds,
		updateTaskOrderInList,
		setEditing,
		dragIndex,
		dragOverIndex,
	]);

	useEffect(() => {
		onConnect(`list.${selectedList.id}.tasks`, async () => {
			if (!disconnected) return;

			setDisconnected(false);

			if (editing) {
				await Promise.all([updateTaskOrderInList(taskIds), getTasks()]);
			}
		});
		onDisconnect(`list.${selectedList.id}.tasks`, async () => {
			setDisconnected(true);
		});
		onEvent(
			'todoTaskCreated',
			`list.${selectedList.id}.tasks.todoTaskCreated`,
			async ({ listId, taskId }: SocketEvent) => {
				if (listId === selectedList.id) {
					await getTask(taskId);
				}
			},
		);
		onEvent(
			'todoTaskUpdated',
			`list.${selectedList.id}.tasks.todoTaskUpdated`,
			async ({ listId, taskId }: SocketEvent) => {
				if (listId === selectedList.id) {
					await getTask(taskId);
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
		onEvent,
		onDisconnect,
		disconnected,
		setDisconnected,
		getTask,
		selectedList.id,
		removeTask,
		editing,
		updateTaskOrderInList,
		taskIds,
	]);

	return (
		<>
			<div className={styles.tasksPanel}>
				<div className={styles.backToListsButton}>
					<DefaultButton onClick={goBack}>Back</DefaultButton>
				</div>
				<AddTask listId={selectedList.id} />
				<ul>
					{taskIds
						.filter((taskId: TodoTask['id']) => !!taskRecord[taskId])
						.map((taskId: TodoTask['id']) => {
							const task = taskRecord[taskId];

							const showInsertTask =
								draggedOverTaskId !== draggedTaskId && task.id === draggedOverTaskId;
							const showInsertTaskBefore = showInsertTask && dragOverIndex < dragIndex;
							const showInsertTaskAfter = showInsertTask && dragOverIndex > dragIndex;

							const insertTaskJsx = showInsertTask && (
								<li className={styles.insertTask}>
									<p>Insert here</p>
								</li>
							);

							return (
								<Fragment key={task.id}>
									{showInsertTaskBefore && insertTaskJsx}
									<li
										id={task.id.toString()}
										className={clsx({
											[styles.task]: true,
											[styles.selectedTask]: task.id === selectedTaskId,
										})}
										onClick={() => setSelectedTaskId(task.id)}
										draggable
										onDragStart={() => {
											setDraggedTaskId(task.id);
										}}
										onDragOver={(e) => {
											setDraggedOverTaskId(Number(e.currentTarget.id));
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
									{showInsertTaskAfter && insertTaskJsx}
								</Fragment>
							);
						})}
				</ul>
			</div>
			{selectedTaskId && (
				<div className={styles.editTaskPanel}>
					<div className={styles.backToTasksButton}>
						<DefaultButton onClick={() => setSelectedTaskId(undefined)}>Back</DefaultButton>
					</div>
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
