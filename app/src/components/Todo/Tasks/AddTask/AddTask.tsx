import React, { useState, useCallback } from 'react';
import { TodoList } from '../../types';
import PrimaryButton from '../../../buttons/PrimaryButton/PrimaryButton';
import TextInput from '../../../inputs/TextInput/TextInput';
import ErrorToast from '../../../toasts/ErrorToast/ErrorToast';
import { useApiClient } from '../../../../contexts/apiClient';
import styles from './styles.css';

interface Props {
	listId: TodoList['id'];
}

const AddTask = (props: Props) => {
	const { listId } = props;

	const [taskName, setTaskName] = useState<string>('');
	const [error, setError] = useState<boolean>(false);

	const { apiClient } = useApiClient();

	const addTask = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			try {
				setError(false);
				await apiClient.post(`/api/todo-lists/${listId}/tasks`, { name: taskName });

				setTaskName('');
			} catch (error) {
				setError(true);
				console.error(error);
			}
		},
		[taskName, listId, apiClient],
	);

	return (
		<form className={styles.root} onSubmit={addTask}>
			<TextInput
				placeholder="Task Name"
				value={taskName}
				onChange={(e) => setTaskName(e.target.value)}
			/>
			<PrimaryButton type="submit">Add Task</PrimaryButton>
			{error && <ErrorToast onExit={() => setError(false)}>Failed to add task</ErrorToast>}
		</form>
	);
};

export default AddTask;
