import { IsBoolean, IsEnum, Length, Matches } from 'class-validator';
import { LikesStatusEnum } from './types';
import { Transform, TransformFnParams } from 'class-transformer';
import { BlogExists } from '../helpers/validator.blogId';

export class BlogCreateInputModelType {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 15)
  name: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 500)
  description: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 100)
  @Matches(/^https:\/\/([a-zA-Z\d_-]+\.)+[a-zA-Z\d_-]+$/)
  websiteUrl: string;
}

export class UserCreateInputModelType {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  @Matches(/^[a-zA-Z\d_-]*$/)
  login: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  password: string;

  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

// export class PostUpdateInputModelType {
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @Length(3, 30)
//   title: string;
//
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @Length(3, 100)
//   shortDescription: string;
//
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @Length(3, 1000)
//   content: string;
//
//   @BlogExists()
//   blogId: string;
// }

export class PostCreateFromBlogInputModelType {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 30)
  title: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 100)
  shortDescription: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 1000)
  content: string;
}

export class EmailInputModelType {
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class LoginInputModelType {
  loginOrEmail: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  password: string;
}

export class NewPasswordInputModelType {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}

export class CommentCreateInputModel {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 300)
  content: string;
}

export class LikeStatusInputModel {
  @IsEnum(LikesStatusEnum)
  likeStatus: string;
}

export class BanUserInputModel {
  @IsBoolean()
  isBanned: boolean;

  @Length(20)
  banReason: string;
}
export class BanBlogInputModel {
  @IsBoolean()
  isBanned: boolean;
}

export class BanUserForBlogInputModel {
  @IsBoolean()
  isBanned: boolean;

  @Length(20)
  banReason: string;

  @BlogExists()
  blogId: string;
}
