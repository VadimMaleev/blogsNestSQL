import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../../repositories/posts/posts.schema';
import { Model } from 'mongoose';
import {
  Comment,
  CommentDocument,
} from '../../../repositories/comments/comments.shema';
import { User, UserDocument } from '../../../repositories/users/users.schema';
import { Blog, BlogDocument } from '../../../repositories/blogs/blogs.schema';
import {
  BannedUserForBlog,
  BannedUsersForBlogDocument,
} from '../../../repositories/users/banned.users.for.blog.schema';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(BannedUserForBlog.name)
    private bannedUserForBlogModel: Model<BannedUsersForBlogDocument>,
  ) {}
  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogModel.deleteMany();
    await this.postModel.deleteMany();
    await this.commentModel.deleteMany();
    await this.userModel.deleteMany();
    await this.bannedUserForBlogModel.deleteMany();
    return true;
  }
}
