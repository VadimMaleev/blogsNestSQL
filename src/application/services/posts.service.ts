import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PostCreateFromBlogInputModelType } from '../../types/input.models';
import { BlogsQueryRepository } from '../../repositories/blogs/blogs.query.repo';
import { CreatePostDto, UriParamsForBloggersApi } from '../../types/dto';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../repositories/posts/posts.repo';
import { plugForCreatingPosts } from '../../helpers/plug.for.creating.posts.and.comments';
import { UsersQueryRepository } from '../../repositories/users/users.query.repo';
import { LikesRepository } from '../../repositories/likes/likes.repo';
import { BlogDocument } from '../../repositories/blogs/blogs.schema';
import { PostDocument } from '../../repositories/posts/posts.schema';
import { PostsQueryRepository } from '../../repositories/posts/posts.query.repo';

@Injectable()
export class PostsService {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected likesRepository: LikesRepository,
  ) {}

  async createPostForBlog(
    postInputModel: PostCreateFromBlogInputModelType,
    blog: BlogDocument,
    userId: string,
  ) {
    const newPost = new CreatePostDto(
      uuidv4(),
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      blog.id,
      blog.name,
      new Date(),
      userId,
      true,
    );
    await this.postRepository.createPost(newPost);
    return plugForCreatingPosts(newPost);
  }

  async deletePost(params: UriParamsForBloggersApi, userId: string) {
    const blog: BlogDocument = await this.blogsQueryRepository.getOneBlogById(
      params.blogId,
    );
    const post: PostDocument = await this.postsQueryRepository.findPostById(
      params.postId,
    );

    if (!blog) throw new NotFoundException('Blog not found');
    if (!post) throw new NotFoundException('Post not Found');
    if (post.userId !== userId) throw new HttpException('Not your own', 403);

    return this.postRepository.deletePost(params.postId);
  }

  async updatePost(
    postId: string,
    postInputModel: PostCreateFromBlogInputModelType,
    blogId: string,
    userId: string,
  ) {
    const blog: BlogDocument = await this.blogsQueryRepository.getOneBlogById(
      blogId,
    );
    const post: PostDocument = await this.postsQueryRepository.findPostById(
      postId,
    );

    if (!blog) throw new NotFoundException('Blog not found');
    if (!post) throw new NotFoundException('Post not Found');
    if (post.userId !== userId) throw new HttpException('Not your own', 403);
    return this.postRepository.updatePost(postId, postInputModel);
  }

  async makeLikeOrUnlike(id: string, userId: string, likeStatus: string) {
    const user = await this.usersQueryRepository.findUserById(userId);
    return this.likesRepository.makeLikeOrUnlike(
      id,
      userId,
      user.login,
      likeStatus,
    );
  }
}
