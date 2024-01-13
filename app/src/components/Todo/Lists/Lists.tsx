import React, { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useApiClient } from '../../../contexts/apiClient';
import styles from './styles.css';
import { TodoList } from '../types';

interface Props {
	setSelectedListId: Dispatch<SetStateAction<number | undefined>>;
	selectedListId?: number;
}

const Lists = (props: Props) => {
	const { setSelectedListId, selectedListId } = props;

	const [lists, setLists] = useState<TodoList[]>();

	const { apiClient } = useApiClient();

	const getLists = useCallback(async () => {
		const { data } = await apiClient.get('/api/todo-lists');
		setLists(data);
	}, [apiClient]);

	useEffect(() => {
		getLists();
	}, []);

	return (
		<>
			<p>TODO: TodoLists</p>
		</>
	);
};

export default Lists;
