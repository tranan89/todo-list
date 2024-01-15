import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { TodoList, TodoTask } from '../../types';
import { useApiClient } from '../../../../contexts/apiClient';
import { useSocket } from '../../../../contexts/socket';
import styles from './styles.css';

interface Props {
	task: TodoTask;
	listId: TodoList['id'];
}

const EditTask = (props: Props) => {
	const { task, listId } = props;

	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(task.name);
	const [description, setDescription] = useState(task.description || '');

	const { apiClient } = useApiClient();
	const { onConnect } = useSocket();

	const debouncedUpdateTask = useCallback(
		debounce(async ({ apiClient, listId, task, name, description }) => {
			await apiClient.patch(`/api/todo-lists/${listId}/tasks/${task.id}`, {
				name,
				...(description && { description }),
			});

			setEditing(false);
		}, 500),
		[],
	);

	const updateTask = useCallback(
		() => debouncedUpdateTask({ apiClient, listId, task, name, description }),
		[task, name, description, listId, apiClient],
	);

	useEffect(() => {
		if (editing) {
			updateTask();
		}
	}, [name, description, editing]);

	useEffect(() => {
		setName(task.name);
	}, [task.name]);

	useEffect(() => {
		setDescription(task.description || '');
	}, [task.description]);

	useEffect(() => {
		onConnect(`task.${task.id}.edit`, async () => {
			if (editing) {
				await updateTask();
			}
		});
	}, [onConnect, task.id, editing, updateTask]);

	return (
		<div className={styles.root}>
			<input
				type="text"
				className={styles.name}
				value={name}
				onChange={(e) => {
					setEditing(true);
					setName(e.target.value);
				}}
			/>
			<textarea
				className={styles.description}
				value={description}
				placeholder="Description"
				onChange={(e) => {
					setEditing(true);
					setDescription(e.target.value);
				}}
			/>
		</div>
	);
};

export default EditTask;
