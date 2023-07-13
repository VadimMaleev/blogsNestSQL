import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BannedUsersForBlogDocument = HydratedDocument<BannedUserForBlog>;

@Schema({ versionKey: false })
export class BannedUserForBlog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: true })
  banDate: Date;

  @Prop({ required: true })
  banReason: string;

  @Prop({ required: true })
  blogId: string;
}

export const BannedUserForBlogSchema =
  SchemaFactory.createForClass(BannedUserForBlog);
