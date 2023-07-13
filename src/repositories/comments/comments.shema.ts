import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ versionKey: false })
export class Comment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  isVisible: boolean;

  updateComment(content: string) {
    this.content = content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment,
};
