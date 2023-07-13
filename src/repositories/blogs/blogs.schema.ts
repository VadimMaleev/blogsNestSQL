import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BlogCreateInputModelType } from '../../types/input.models';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ versionKey: false })
export class Blog {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  isMembership: boolean;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ nullable: true, default: null })
  banDate: Date | null;

  updateBlog(updateData: BlogCreateInputModelType) {
    this.name = updateData.name;
    this.description = updateData.description;
    this.websiteUrl = updateData.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
};
