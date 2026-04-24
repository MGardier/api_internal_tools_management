import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsGreaterThanOrEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGreaterThanOrEqual',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];
          if (relatedValue === undefined || relatedValue === null) return true;
          if (typeof value !== 'number' || typeof relatedValue !== 'number') return false;
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be greater than or equal to ${args.constraints[0]}`;
        },
      },
    });
  };
}
