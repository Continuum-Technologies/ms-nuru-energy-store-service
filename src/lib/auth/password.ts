import { hash, verify } from "@node-rs/argon2";

// Argon2id (the library default) with OWASP-recommended minimums:
// m=19 MiB, t=2, p=1.
const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string): Promise<string> {
  return hash(password, HASH_OPTIONS);
}

// Argon2's encoded hash embeds its own parameters, so verification doesn't
// need HASH_OPTIONS passed back in.
export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return verify(passwordHash, password);
}
