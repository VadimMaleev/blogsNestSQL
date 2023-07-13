import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../repositories/blogs/blogs.query.repo';

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
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async validate(id: string) {
    const blog = await this.blogsQueryRepository.getOneBlogById(id);
    if (!blog) return false;
    return true;
  }

  defaultMessage() {
    return `Blog doesn't exist`;
  }
}
