import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';

export function IsGreaterThanZeroNumberArray(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isPositiveNumberArray',
      validator: {
        validate(value: any): boolean {
          if (!Array.isArray(value)) {
            return false;
          }

          for (const item of value) {
            if (typeof item !== 'number' || item < 0) {
              return false;
            }
          }

          return true;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must contain only positive numbers',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
