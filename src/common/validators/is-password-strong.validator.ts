import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordStrong',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
        },
        defaultMessage() {
          return 'Password must be at least 8 characters, contain uppercase letters and numbers';
        },
      },
    });
  };
}
