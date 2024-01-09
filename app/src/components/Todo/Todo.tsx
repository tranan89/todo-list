import React, { useCallback, useState } from 'react';
import styles from './styles.css';
import { TodoTask, TodoList } from './types';
import Lists from './Lists/Lists';
import Tasks from './Tasks/Tasks';
import AddTask from './AddTask/AddTask';
import Task from './Task/Task';

const Todo = () => {
	const [lists, setLists] = useState<TodoList[]>();
	const [selectedList, setSelectedList] = useState<TodoList>();

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
			<div className={styles.listPanel}>
				<Lists />
			</div>
			{selectedList && (
				<div className={styles.tasksPanel}>
					<AddTask onTaskCreated={addTask} />
					<Tasks taskList={taskList} selectedTask={selectedTask} onTaskSelected={setSelectedTask} />
				</div>
			)}
			{selectedTask && (
				<div className={styles.taskPanel}>
					<Task task={selectedTask} onTaskUpdated={updateTask} />
				</div>
			)}
		</div>
	);
};

export default Todo;
