import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useSocket } from '../../contexts/socket';
import styles from './styles.css';

const ConnectionListener = () => {
	const [disconnected, setDisconnected] = useState<boolean>(true);
	const [show, setShow] = useState<boolean>(true);
	const [slideOut, setSlideOut] = useState<boolean>(false);
	const [initialConnect, setInitialConnect] = useState<boolean>(true);

	const { onConnect, onDisconnect } = useSocket();

	useEffect(() => {
		onConnect('connectionListener', () => {
			setDisconnected(false);

			if (initialConnect) {
				setShow(false);
				return;
			}
			setTimeout(() => {
				setSlideOut(true);

				setTimeout(() => {
					setShow(false);
					setSlideOut(false);
				}, 500);
			}, 3000);
		});
		onDisconnect('connectionListener', () => {
			setDisconnected(true);
			setShow(true);
		});
	}, [onConnect, onDisconnect, setDisconnected, setSlideOut, setShow, initialConnect]);

	useEffect(() => {
		setTimeout(() => {
			// Show banner if socket hasn't connected within 3s
			setInitialConnect(false);
		}, 3000);
	}, []);

	if (!show || initialConnect) {
		return null;
	}
	if (disconnected) {
		return (
			<div className={clsx(styles.root, styles.disconnected, styles.slideIn)}>
				<p>Disconnected</p>
			</div>
		);
	}
	return (
		<div className={clsx(styles.root, styles.connected, slideOut && styles.slideOut)}>
			<p>Connected</p>
		</div>
	);
};

export default ConnectionListener;
