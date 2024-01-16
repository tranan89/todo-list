import React from 'react';
import clsx from 'clsx';
import styles from './styles.css';
import BaseButton from '../BaseButton';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

const DefaultButton = (props: Props) => {
	const { children, className, ...rest } = props;

	return (
		<BaseButton className={clsx(styles.root, className)} {...rest}>
			{children}
		</BaseButton>
	);
};

export default DefaultButton;
