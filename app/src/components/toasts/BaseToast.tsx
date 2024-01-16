import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './styles.css';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	portalSelector?: string;
	onExit?: () => void;
	duration?: number;
}

const BaseToast = (props: Props) => {
	const {
		children,
		portalSelector = '#portal',
		duration = 3000,
		onExit,
		className,
		...rest
	} = props;

	const [show, setShow] = useState(true);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setShow(false);
		}, duration);

		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (show || !onExit) {
			return;
		}
		const timeout = setTimeout(() => {
			onExit();
		}, 300);

		return () => clearTimeout(timeout);
	}, [show, onExit]);

	const portalRef = useMemo(() => document.querySelector(portalSelector), [portalSelector]);

	if (!portalRef) {
		return null;
	}
	return createPortal(
		<div {...rest} className={clsx(styles.root, className, show ? styles.enter : styles.leave)}>
			{children}
		</div>,
		portalRef,
	);
};

export default BaseToast;
