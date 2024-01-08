import React from 'react';
import { TodoTask } from '../types';
import styles from './styles.css';

interface Props {
	onTaskSelected: (task: TodoTask) => void;
	taskList: TodoTask[];
	selectedTask?: TodoTask;
}

const Tasks = (props: Props) => {
	const { onTaskSelected, taskList, selectedTask } = props;

	return (
		<ul className={styles.root}>
			{taskList.map((task: TodoTask) => {
				const className = task.id === selectedTask?.id ? styles.selectedTask : styles.task;

				return (
					<li className={className} onClick={() => onTaskSelected(task)} key={task.id}>
						<p>{task.name}</p>
					</li>
				);
			})}
		</ul>
	);
};

export default Tasks;
