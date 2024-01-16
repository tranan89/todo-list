import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useSocket } from '../../contexts/socket';
import styles from './styles.css';

const ConnectionListener = () => {
	const [disconnected, setDisconnected] = useState<boolean>(false);
	const [show, setShow] = useState<boolean>(false);

	const { onConnect, onDisconnect } = useSocket();

	useEffect(() => {
		onConnect('connectionListener', () => {
			setDisconnected(false);

			setTimeout(() => {
				setShow(false);
			}, 3000);
		});
		onDisconnect('connectionListener', () => {
			setDisconnected(true);
			setShow(true);
		});
	}, [onConnect, onDisconnect, setDisconnected]);

	useEffect(() => {
		setTimeout(() => {
			setDisconnected(true);
			setShow(true);
		}, 3000);
	}, []);

	if (disconnected) {
		return (
			<div className={clsx(styles.root, styles.disconnected, show ? styles.show : styles.hide)}>
				Disconnected
			</div>
		);
	}
	return (
		<div className={clsx(styles.root, styles.connected, show ? styles.show : styles.hide)}>
			Connected
		</div>
	);
};

export default ConnectionListener;
