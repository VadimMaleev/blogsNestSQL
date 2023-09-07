import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../../types/dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';
import { PostCreateFromBlogInputModelType } from '../../types/input.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createPost(newPost: CreatePostDto) {
    await this.dataSource.query(
      `
        INSERT INTO public."Posts"(
        "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isVisible")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `,
      [
        newPost.id,
        newPost.title,
        newPost.shortDescription,
        newPost.content,
        newPost.blogId,
        newPost.blogName,
        newPost.createdAt,
        // newPost.userId,
        newPost.isVisible,
      ],
    );
  }

  async deletePost(id: string): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM public."Posts"
        WHERE "id" = $1
      `,
      [id],
    );
    return true;
  }

  async updatePost(
    postId: string,
    postInputModel: PostCreateFromBlogInputModelType,
  ): Promise<boolean> {
    await this.dataSource.query(
      `
        UPDATE public."Posts"
        SET  "title" = $1, 
             "shortDescription" = $2,
             "content" = $3
        WHERE "id" = $4
        `,
      [
        postInputModel.title,
        postInputModel.shortDescription,
        postInputModel.content,
        postId,
      ],
    );
    return true;
  }

  async updateVisibleStatus(blogId: string, banStatus: boolean) {
    await this.dataSource.query(
      `
        UPDATE public."Posts"
        SET  "isVisible" = $1
        WHERE "blogId" = $2
        `,
      [!banStatus, blogId],
    );
  }

  async getPostById(id: string) {
    const post = await this.dataSource.query(
      `
        SELECT "id", "title", "shortDescription", "content", "blogId", "blogName", "createdAt", "isVisible"
        FROM public."Posts"
        WHERE "id" = $1
      `,
      [id],
    );
    return post[0];
  }
}
