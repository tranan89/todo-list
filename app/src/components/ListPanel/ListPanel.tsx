import React from 'react';
import clsx from 'clsx';
import styles from './styles.css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const ListPanel = (props: Props) => {
	const { children, className, ...rest } = props;

	return (
		<div className={clsx(styles.root, className)} {...rest}>
			{children}
		</div>
	);
};

export default ListPanel;
