import React, { useState } from 'react';
import styles from './styles.css';
import TodoLists from './TodoLists/TodoLists';
import TodoTasks from './TodoTasks/TodoTasks';

const Todo = () => {
	return (
		<div className={styles.root}>
			<TodoLists />
			<TodoTasks />
		</div>
	);
};

export default Todo;
