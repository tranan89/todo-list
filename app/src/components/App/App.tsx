import React from 'react';
import styles from './styles.css';
import ConnectionListener from '../ConnectionListener/ConnectionListener';
import Todo from '../Todo/Todo';

const App = () => {
	return (
		<div className={styles.root}>
			<ConnectionListener />
			<main className={styles.content}>
				<h1>Todo</h1>
				<Todo />
			</main>
			<div id="portal" />
		</div>
	);
};

export default App;
