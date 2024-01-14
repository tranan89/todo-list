import React, { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useApiClient } from '../../../contexts/apiClient';
import styles from './styles.css';
import { TodoList } from '../types';
import AddList from './AddList/AddList';
import List from './List/List';

interface Props {
	setSelectedList: Dispatch<SetStateAction<TodoList | undefined>>;
	selectedList?: TodoList;
}

const Lists = (props: Props) => {
	const { setSelectedList, selectedList } = props;

	const [lists, setLists] = useState<TodoList[]>([]);

	const { apiClient } = useApiClient();

	const getLists = useCallback(async () => {
		const { data } = (await apiClient.get('/api/todo-lists')).data;
		setLists(data);
	}, [apiClient, setLists]);

	const addList = useCallback(
		async ({ listId }: { listId: TodoList['id'] }) => {
			const { data } = (await apiClient.get(`/api/todo-lists/${listId}`)).data;
			setLists([data, ...lists]);
		},
		[apiClient, lists, setLists],
	);

	const updateList = useCallback(
		(list: TodoList) => {
			if (selectedList?.id === list.id) {
				setSelectedList(list);
			}
			setLists([list, ...lists.filter((l) => l.id !== list.id)]);
		},
		[lists, selectedList?.id, setLists, setSelectedList],
	);

	useEffect(() => {
		getLists();
	}, []);

	return (
		<div className={styles.listPanel}>
			<AddList onListCreated={addList} />
			<ul className={styles.root}>
				{lists.map((list: TodoList) => {
					return (
						<List
							{...list}
							selectedListId={selectedList?.id}
							key={list.id}
							onClick={() => setSelectedList(list)}
							updateList={(list) => updateList(list)}
						/>
					);
				})}
			</ul>
		</div>
	);
};

export default Lists;
