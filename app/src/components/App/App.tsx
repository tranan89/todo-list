import styles from './styles.css';
import Todo from '../Todo/Todo';
import React from 'react';

const App = () => {
	return (
		<main className={styles.root}>
			<h1>Todo List</h1>
			<Todo />
		</main>
	);
};

export default App;
