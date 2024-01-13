import React from 'react';
import clsx from 'clsx';
import styles from './styles.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

const PrimaryButton = (props: Props) => {
	const { children, className, ...rest } = props;

	return (
		<button className={clsx(styles.root, className)} {...rest}>
			{children}
		</button>
	);
};

export default PrimaryButton;
