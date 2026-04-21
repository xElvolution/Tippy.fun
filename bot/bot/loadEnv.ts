import dotenv from 'dotenv';
import path from 'path';

const root = process.cwd();
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });
