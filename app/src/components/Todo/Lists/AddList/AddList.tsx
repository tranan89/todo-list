import React, { useState, useCallback } from 'react';
import { TodoList } from '../../types';
import PrimaryButton from '../../../buttons/PrimaryButton/PrimaryButton';
import TextInput from '../../../inputs/TextInput/TextInput';
import { useApiClient } from '../../../../contexts/apiClient';
import styles from './styles.css';
import ErrorToast from '../../../toasts/ErrorToast/ErrorToast';

interface Props {
	onListCreated: ({ listId }: { listId: TodoList['id'] }) => void;
}

const AddList = (props: Props) => {
	const { onListCreated } = props;

	const [listName, setListName] = useState<string>('');
	const [error, setError] = useState<boolean>(false);

	const { apiClient } = useApiClient();

	const addList = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			try {
				setError(false);

				const {
					data: { listId },
				} = (await apiClient.post('/api/todo-lists', { name: listName })).data;

				onListCreated({ listId });
				setListName('');
			} catch (error) {
				console.error(error);
				setError(true);
			}
		},
		[listName, apiClient],
	);

	return (
		<form className={styles.root} onSubmit={addList}>
			<TextInput
				placeholder="List Name"
				value={listName}
				onChange={(e) => setListName(e.target.value)}
			/>
			<PrimaryButton type="submit">Add List</PrimaryButton>
			{error && <ErrorToast onExit={() => setError(false)}>Failed to add list</ErrorToast>}
		</form>
	);
};

export default AddList;
