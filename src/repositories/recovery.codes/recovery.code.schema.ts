import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RecoveryCodeDocument = HydratedDocument<RecoveryCode>;

@Schema({ versionKey: false })
export class RecoveryCode {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  codeExpirationDate: Date;

  @Prop({ required: true })
  userId: string;
}

export const RecoveryCodeSchema = SchemaFactory.createForClass(RecoveryCode);
