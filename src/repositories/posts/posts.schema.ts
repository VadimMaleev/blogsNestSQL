import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostCreateFromBlogInputModelType } from '../../types/input.models';

export type PostDocument = HydratedDocument<Post>;

@Schema({ versionKey: false })
export class Post {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  isVisible: boolean;

  updatePost(updateData: PostCreateFromBlogInputModelType) {
    this.title = updateData.title;
    this.shortDescription = updateData.shortDescription;
    this.content = updateData.content;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
};
