import React from 'react';
import clsx from 'clsx';
import styles from './styles.css';
import BaseToast, { Props as BaseProps } from '../BaseToast';

interface Props extends BaseProps {}

const SuccessToast = (props: Props) => {
	const { children, className, ...rest } = props;

	return (
		<BaseToast className={clsx(styles.root, className)} {...rest}>
			{children}
		</BaseToast>
	);
};

export default SuccessToast;
