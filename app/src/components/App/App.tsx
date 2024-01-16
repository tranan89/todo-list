import React from 'react';
import styles from './styles.css';
import Todo from '../Todo/Todo';

const App = () => {
	return (
		<>
			<main className={styles.root}>
				<h1>Todo</h1>
				<Todo />
			</main>
			<div id="portal" />
		</>
	);
};

export default App;
