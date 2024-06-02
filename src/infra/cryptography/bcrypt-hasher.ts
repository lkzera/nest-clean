import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator';
import { compare, hash } from 'bcryptjs';

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 6;
  hash(plain: string): Promise<string> {
    return hash(plain, 6);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }

}