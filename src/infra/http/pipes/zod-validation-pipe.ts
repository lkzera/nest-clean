import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) { }

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new BadRequestException({
          message: 'Validation error',
          statusCode: 400,
          error: `Field name: ${firstError.path[0]} is ${firstError.message}`
        });
      }
      throw new BadRequestException('Validation error');
    }

    return value;
  }

}