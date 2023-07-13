import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type JwtDocument = HydratedDocument<JwtBlackList>;

@Schema({ versionKey: false })
export class JwtBlackList {
  @Prop({ required: true })
  refreshToken: string;
}

export const JwtTokensSchema = SchemaFactory.createForClass(JwtBlackList);
