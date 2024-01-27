import { z } from 'zod';

export const includeSchema = z.preprocess((val) => {
	return typeof val === 'string' ? [val] : val;
}, z.array(z.string()).min(1));
