import crypto from 'node:crypto';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  return Buffer.from(hex, 'hex');
}

export interface EncPayload {
  ciphertext: string;
  iv: string;
  tag: string;
}

export function encryptUtf8(plain: string): EncPayload {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

export function decryptUtf8(p: EncPayload): string {
  const key = getKey();
  const iv = Buffer.from(p.iv, 'hex');
  const tag = Buffer.from(p.tag, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(Buffer.from(p.ciphertext, 'hex')), decipher.final()]);
  return out.toString('utf8');
}
