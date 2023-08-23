import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repositories/blogs/blogs.repo';

export function BlogExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogExistRule,
    });
  };
}

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistRule implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(id: string): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogById(id);
    if (!blog) return false;
    return true;
  }

  defaultMessage() {
    return `Blog doesn't exist`;
  }
}
