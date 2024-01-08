import React, { useState, useCallback } from 'react';
import { TodoTask } from '../types';
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
			<input
				type="text"
				placeholder="Task Name"
				value={taskName}
				onChange={(e) => setTaskName(e.target.value)}
			/>
			<button type="submit">Add Task</button>
		</form>
	);
};

export default AddTask;
