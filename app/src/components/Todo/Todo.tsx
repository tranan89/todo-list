import React, { useState } from 'react';
import styles from './styles.css';
import { TodoList } from './types';
import Lists from './Lists/Lists';
import Tasks from './Tasks/Tasks';

const Todo = () => {
	const [selectedList, setSelectedList] = useState<TodoList>();

	return (
		<div className={styles.root}>
			<Lists setSelectedList={setSelectedList} selectedList={selectedList} />
			{selectedList && <Tasks selectedList={selectedList} key={selectedList.id} />}
		</div>
	);
};

export default Todo;
