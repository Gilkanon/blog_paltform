import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function OneOfTwoFields(
  field1: string,
  field2: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'oneOfTwoFields',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [field1, field2],
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const [field1, field2] = args.constraints;
          const value1 = (args.object as any)[field1];
          const value2 = (args.object as any)[field2];
          return (!!value1 && !value2) || (!value1 && !!value2);
        },
        defaultMessage(args: ValidationArguments) {
          const [field1, field2] = args.constraints;
          return `Either ${field1} or ${field2} must be provided, but not both.`;
        },
      },
    });
  };
}
