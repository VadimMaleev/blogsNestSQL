import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  codeExpirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop()
  banDate: Date | null;

  @Prop()
  banReason: string | null;

  updateConfirmationCode(code: string, date: Date) {
    this.confirmationCode = code;
    this.codeExpirationDate = date;
  }

  updatePasswordHash(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  updateConfirmationCode: User.prototype.updateConfirmationCode,
  updatePasswordHash: User.prototype.updatePasswordHash,
};
