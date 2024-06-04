import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidAttachmentTypeError extends Error implements UseCaseError {
  constructor(typeName: string) {
    super(`File type "${typeName}" is not valid.`);
  }
}