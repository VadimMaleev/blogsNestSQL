import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema({ versionKey: false })
export class Like {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  idOfEntity: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  isVisible: boolean;
}

export const LikesSchema = SchemaFactory.createForClass(Like);
