import styles from './styles.css';
import TodoList from '../TodoList/TodoList';
import React from 'react';

const App = () => {
	return (
		<main className={styles.root}>
			<h1>Todo List</h1>
			<TodoList />
		</main>
	);
};

export default App;
