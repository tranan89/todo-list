import { config } from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

const configs = config({ path: path.resolve(process.cwd(), envFile) });

export default configs;
