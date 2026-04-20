import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException({
        error: 'Validation failed',
        details: {
          [metadata.data ?? 'value']:
            `${metadata.data ?? 'value'} must be a positive integer`,
        },
      });
    }
    return parsed;
  }
}
