import React, { useState, useCallback } from 'react';
import { TodoList } from '../../types';
import PrimaryButton from '../../../buttons/PrimaryButton/PrimaryButton';
import TextInput from '../../../inputs/TextInput/TextInput';
import { useApiClient } from '../../../../contexts/apiClient';
import styles from './styles.css';

interface Props {
	listId: TodoList['id'];
}

const AddTask = (props: Props) => {
	const { listId } = props;

	const [taskName, setTaskName] = useState<string>('');

	const { apiClient } = useApiClient();

	const addTask = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			await apiClient.post(`/api/todo-lists/${listId}/tasks`, { name: taskName });

			setTaskName('');
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
		</form>
	);
};

export default AddTask;
