import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicBlogsController } from './api/public.api/blogs/publicBlogsController';
import { BlogsRepository } from './repositories/blogs/blogs.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Blog, BlogSchema } from './repositories/blogs/blogs.schema';
import { BlogsQueryRepository } from './repositories/blogs/blogs.query.repo';
import { UsersSAController } from './api/sa.api/users/usersSAController';
import { UsersService } from './application/services/users.service';
import { UsersRepository } from './repositories/users/users.repo';
import { UsersQueryRepository } from './repositories/users/users.query.repo';
import { AuthService } from './application/services/auth.service';
import { User, UserSchema } from './repositories/users/users.schema';
import { Post, PostSchema } from './repositories/posts/posts.schema';
import { PublicPostsController } from './api/public.api/posts/publicPostsController';
import { PostsService } from './application/services/posts.service';
import { PostsRepository } from './repositories/posts/posts.repo';
import { PostsQueryRepository } from './repositories/posts/posts.query.repo';
import { Comment, CommentSchema } from './repositories/comments/comments.shema';
import { PublicCommentsController } from './api/public.api/comments/publicCommentsController';
import { CommentsService } from './application/services/comments.service';
import { CommentsRepository } from './repositories/comments/comments.repo';
import { CommentsQueryRepository } from './repositories/comments/comments.query.repo';
import { TestingController } from './api/public.api/testing/testing.controller';
import {
  RecoveryCode,
  RecoveryCodeSchema,
} from './repositories/recovery.codes/recovery.code.schema';
import { RecoveryCodeRepository } from './repositories/recovery.codes/recovery.code.repo';
import { EmailAdapter } from './adapters/email-adapter';
import { JWTService } from './repositories/jwt/jwt.service';
import { AuthController } from './api/public.api/auth/auth.controller';
import { DevicesRepository } from './repositories/devices/devices.repository';
import { DevicesQueryRepository } from './repositories/devices/devices.query.repository';
import { Device, DeviceSchema } from './repositories/devices/devices.schema';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesController } from './api/public.api/devices/devices.controller';
import { DevicesService } from './api/public.api/devices/devices.service';
import { JwtBlackList, JwtTokensSchema } from './repositories/jwt/jwt.schema';
import { JwtRepository } from './repositories/jwt/jwt.repository';
import { Like, LikesSchema } from './repositories/likes/likes.schema';
import { LikesRepository } from './repositories/likes/likes.repo';
import { ExtractUserIdFromHeadersUseCase } from './helpers/extract.userId.from.headers';
import { BlogExistRule } from './helpers/validator.blogId';
import { BlogsService } from './application/services/blogs.service';
import { BloggersBlogsController } from './api/bloggers.api/blogs/bloggersBlogsController';
import { BlogsSAController } from './api/sa.api/blogs/blogsSAController';
import { CheckCredentialsUseCase } from './application/use.cases/check.credentials.useCase';
import { CreateUserUseCase } from './application/use.cases/create.user.useCase';
import { LogoutUseCase } from './application/use.cases/logout.useCase';
import { CqrsModule } from '@nestjs/cqrs';
import { NewPasswordUseCase } from './application/use.cases/new.password.useCase';
import { PasswordRecoveryUseCase } from './application/use.cases/password.recovery.useCase';
import {
  BannedUserForBlog,
  BannedUserForBlogSchema,
} from './repositories/users/banned.users.for.blog.schema';
import { BloggersUsersController } from './api/bloggers.api/users/bloggers.users.controller';
import { BannedUsersForBlogRepository } from './repositories/users/banned.users.for.blog.repo';

const useCases = [
  CheckCredentialsUseCase,
  CreateUserUseCase,
  LogoutUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.mongooseUri),
    ThrottlerModule.forRoot({
      // ttl: 10,
      // limit: 5,
    }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: RecoveryCode.name, schema: RecoveryCodeSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: JwtBlackList.name, schema: JwtTokensSchema },
      { name: Like.name, schema: LikesSchema },
      { name: BannedUserForBlog.name, schema: BannedUserForBlogSchema },
    ]),
  ],
  controllers: [
    AppController,
    PublicBlogsController,
    UsersSAController,
    PublicPostsController,
    PublicCommentsController,
    TestingController,
    AuthController,
    DevicesController,
    BloggersBlogsController,
    BloggersUsersController,
    BlogsSAController,
    UsersSAController,
  ],
  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    RecoveryCodeRepository,
    EmailAdapter,
    JWTService,
    DevicesService,
    DevicesRepository,
    DevicesQueryRepository,
    JwtRepository,
    LikesRepository,
    BannedUsersForBlogRepository,
    ExtractUserIdFromHeadersUseCase,
    BlogExistRule,
    ...useCases,
  ],
})
export class AppModule {}
