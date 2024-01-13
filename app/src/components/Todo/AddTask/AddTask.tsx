import React, { useState, useCallback } from 'react';
import { TodoTask } from '../types';
import PrimaryButton from '../../buttons/PrimaryButton/PrimaryButton';
import TextInput from '../../inputs/TextInput/TextInput';
import styles from './styles.css';

interface Props {
	onTaskCreated: (taskName: TodoTask) => void;
}

const AddTask = (props: Props) => {
	const { onTaskCreated } = props;

	const [taskName, setTaskName] = useState<string>('');

	const addTask = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const task = { name: taskName, id: Math.round(Math.random() * 999999) + 1 };

			onTaskCreated(task);
			setTaskName('');
		},
		[taskName],
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
