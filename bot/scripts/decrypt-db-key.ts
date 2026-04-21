/**
 * Decrypt a Tippy users row: set DB_CIPHER, DB_IV, DB_TAG (hex) and ENCRYPTION_KEY in .env.
 * Run: pnpm exec tsx scripts/decrypt-db-key.ts
 * Do not commit secrets; redirect output to a local file if needed.
 */
import 'dotenv/config';
import { decryptUtf8 } from '../lib/crypto/vault';

const ciphertext = process.env.DB_CIPHER?.trim();
const iv = process.env.DB_IV?.trim();
const tag = process.env.DB_TAG?.trim();

if (!ciphertext || !iv || !tag) {
  console.error('Set DB_CIPHER, DB_IV, DB_TAG (from users.encrypted_private_key, key_iv, key_tag).');
  process.exit(1);
}

console.log(decryptUtf8({ ciphertext, iv, tag }));
