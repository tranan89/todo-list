import React, { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useApiClient } from '../../../contexts/apiClient';
import styles from './styles.css';
import { TodoList } from '../types';
import AddList from './AddList/AddList';

interface Props {
	setSelectedListId: Dispatch<SetStateAction<number | undefined>>;
	selectedListId?: number;
}

const Lists = (props: Props) => {
	const { setSelectedListId, selectedListId } = props;

	const [lists, setLists] = useState<TodoList[]>([]);

	const { apiClient } = useApiClient();

	const getLists = useCallback(async () => {
		const { data } = (await apiClient.get('/api/todo-lists')).data;
		setLists(data);
	}, [apiClient]);

	const addList = useCallback(
		async ({ listId }: { listId: TodoList['id'] }) => {
			const { data } = (await apiClient.get(`/api/todo-lists/${listId}`)).data;
			setLists([data, ...lists]);
		},
		[apiClient, lists],
	);

	useEffect(() => {
		getLists();
	}, []);

	return (
		<>
			<AddList onListCreated={addList} />
			<ul className={styles.root}>
				{lists.map((list: TodoList) => {
					const className = list.id === selectedListId ? styles.selectedList : styles.list;

					return (
						<li className={className} onClick={() => setSelectedListId(list.id)} key={list.id}>
							<p>{list.name}</p>
						</li>
					);
				})}
			</ul>
		</>
	);
};

export default Lists;
