import React, { useState, useCallback } from 'react';
import ListPanel from '../../ListPanel/ListPanel';
import styles from './styles.css';
import { type TodoTask } from './types';
import AddTask from './AddTask/AddTask';
import Tasks from './Tasks/Tasks';
import Task from './Task/Task';

const TodoTasks = () => {
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
		<>
			<ListPanel className={styles.tasks}>
				<AddTask onTaskCreated={addTask} />
				<Tasks
					taskList={taskList}
					selectedTask={selectedTask}
					onTaskSelected={(task: TodoTask) => setSelectedTask(task)}
				/>
			</ListPanel>
			<div className={styles.task}>
				{selectedTask && (
					<Task task={selectedTask} key={selectedTask.id} onTaskUpdated={updateTask} />
				)}
			</div>
		</>
	);
};

export default TodoTasks;
