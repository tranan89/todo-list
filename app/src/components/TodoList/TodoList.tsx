import React, { useState, useCallback } from 'react';
import styles from './styles.css';
import { type TodoTask } from './types';
import AddTask from './AddTask/AddTask';
import List from './List/List';
import Task from './Task/Task';

const TodoList = () => {
	const [taskList, setTaskList] = useState<TodoTask[]>([]);
	const [selectedTask, setSelectedTask] = useState<TodoTask>();

	const addTask = useCallback((task: TodoTask) => {
		setTaskList((prevTaskList) => {
			return [task, ...prevTaskList];
		});
	}, []);

	const updateTask = useCallback((task: TodoTask) => {
		setTaskList((prevTaskList) => {
			return prevTaskList.map((t) => {
				if (t.id !== task.id) {
					return t;
				}
				return {
					...t,
					...task,
				};
			});
		});
	}, []);

	return (
		<div className={styles.root}>
			<div className={styles.leftPanel}>
				<AddTask onTaskCreated={addTask} />
				<List
					taskList={taskList}
					selectedTask={selectedTask}
					onTaskSelected={(task: TodoTask) => setSelectedTask(task)}
				/>
			</div>
			<div className={styles.task}>
				{selectedTask && (
					<Task task={selectedTask} key={selectedTask.id} onTaskUpdated={updateTask} />
				)}
			</div>
		</div>
	);
};

export default TodoList;
