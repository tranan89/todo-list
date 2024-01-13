import React from 'react';
import clsx from 'clsx';
import styles from './styles.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

const TextInput = (props: Props) => {
	const { className, ...rest } = props;

	return <input type="text" className={clsx(styles.root, className)} {...rest} />;
};

export default TextInput;
