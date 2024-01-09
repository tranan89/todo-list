import React, { useState, useEffect } from 'react';
import { TodoTask } from '../types';
import styles from './styles.css';

interface Props {
	task: TodoTask;
	onTaskUpdated: (task: TodoTask) => void;
}

const Task = (props: Props) => {
	const { task, onTaskUpdated } = props;

	const [name, setName] = useState(task.name);
	const [description, setDescription] = useState(task.description);

	useEffect(() => {
		onTaskUpdated({
			...task,
			name,
			description,
		});
	}, [task, name, description]);

	return (
		<div className={styles.root}>
			<input
				type="text"
				className={styles.name}
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<textarea
				className={styles.description}
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
		</div>
	);
};

export default Task;
