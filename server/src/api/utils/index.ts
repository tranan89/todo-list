type Select = {
	[key: string]: boolean;
};

export const getSelectFromInclude = (include: string[]): Select => {
	return include?.reduce(
		(acc: Select, curr: string) => {
			acc[curr] = true;
			return acc;
		},
		{ id: true } as Select,
	);
};
