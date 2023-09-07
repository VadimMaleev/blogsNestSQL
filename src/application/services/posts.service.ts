import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PostCreateFromBlogInputModelType } from '../../types/input.models';
import { CreatePostDto, UriParamsForBloggersApi } from '../../types/dto';
import { v4 as uuidv4 } from 'uuid';
import { PostsRepository } from '../../repositories/posts/posts.repo';
import { plugForCreatingPosts } from '../../helpers/plug.for.creating.posts.and.comments';
import { LikesRepository } from '../../repositories/likes/likes.repo';
import { BlogDocument } from '../../repositories/blogs/blogs.schema';
import { PostDocument } from '../../repositories/posts/posts.schema';
import { UsersRepository } from '../../repositories/users/users.repo';
import { BlogsRepository } from '../../repositories/blogs/blogs.repo';

@Injectable()
export class PostsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    protected likesRepository: LikesRepository,
  ) {}

  async createPostForBlog(
    postInputModel: PostCreateFromBlogInputModelType,
    blog: BlogDocument,
    // userId: string,
  ) {
    const newPost = new CreatePostDto(
      uuidv4(),
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      blog.id,
      blog.name,
      new Date(),
      // userId,
      true,
    );
    await this.postsRepository.createPost(newPost);
    return plugForCreatingPosts(newPost);
  }

  async deletePost(params: UriParamsForBloggersApi /*userId: string*/) {
    const blog: BlogDocument = await this.blogsRepository.getBlogById(
      params.blogId,
    );
    const post: PostDocument = await this.postsRepository.getPostById(
      params.postId,
    );

    if (!blog) throw new NotFoundException('Blog not found');
    if (!post) throw new NotFoundException('Post not Found');
    // if (post.userId !== userId) throw new HttpException('Not your own', 403);

    return this.postsRepository.deletePost(params.postId);
  }

  async updatePost(
    postId: string,
    postInputModel: PostCreateFromBlogInputModelType,
    blogId: string,
    // userId: string,
  ) {
    const blog: BlogDocument = await this.blogsRepository.getBlogById(blogId);
    const post: PostDocument = await this.postsRepository.getPostById(postId);

    if (!blog) throw new NotFoundException('Blog not found');
    if (!post) throw new NotFoundException('Post not Found');
    //if (post.userId !== userId) throw new HttpException('Not your own', 403);
    return this.postsRepository.updatePost(postId, postInputModel);
  }

  async makeLikeOrUnlike(id: string, userId: string, likeStatus: string) {
    const user = await this.usersRepository.findUserById(userId);
    return this.likesRepository.makeLikeOrUnlike(
      id,
      userId,
      user.login,
      likeStatus,
    );
  }
}
