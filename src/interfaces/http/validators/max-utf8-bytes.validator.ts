import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Limits a string by its UTF-8 byte length rather than its character count.
 * bcrypt reads at most 72 bytes, and one character may take up to 4 bytes.
 */
@ValidatorConstraint({ name: 'maxUtf8Bytes' })
export class MaxUtf8BytesConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [max] = args.constraints as [number];
    return typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= max;
  }

  defaultMessage(args: ValidationArguments): string {
    const [max] = args.constraints as [number];
    return `${args.property} must be at most ${max} bytes when UTF-8 encoded`;
  }
}

export function MaxUtf8Bytes(
  max: number,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      target: target.constructor,
      propertyName: String(propertyName),
      options,
      constraints: [max],
      validator: MaxUtf8BytesConstraint,
    });
  };
}
