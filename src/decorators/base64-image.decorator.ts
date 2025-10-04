import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom validator for base64 image data with data URL prefix
 */
export function IsBase64Image(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBase64Image',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // null veya undefined ise geçerli (opsiyonel alan)
          if (value === null || value === undefined) {
            return true;
          }

          if (typeof value !== 'string') {
            return false;
          }

          // Boş string ise geçerli (resmi silmek için)
          if (value === '') {
            return true;
          }

          // Check if it's a data URL format
          if (value.startsWith('data:image/') && value.includes(';base64,')) {
            const base64Part = value.split(';base64,')[1];
            if (base64Part) {
              // Check if the base64 part is valid
              const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
              return base64Regex.test(base64Part);
            }
          }

          // Check if it's just base64 without data URL prefix
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
          return base64Regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Resim base64 formatında olmalıdır (data:image/...;base64, formatında veya sadece base64 string)';
        },
      },
    });
  };
}
