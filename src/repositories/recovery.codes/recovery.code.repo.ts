import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RecoveryCode, RecoveryCodeDocument } from './recovery.code.schema';
import { Model } from 'mongoose';
import { RecoveryCodeDto } from '../../types/dto';

@Injectable()
export class RecoveryCodeRepository {
  constructor(
    @InjectModel(RecoveryCode.name)
    private recoveryCodeModel: Model<RecoveryCodeDocument>,
  ) {}

  async createRecoveryCode(recoveryCode: RecoveryCodeDto) {
    await new this.recoveryCodeModel(recoveryCode).save();
  }

  async findCode(recoveryCode: string) {
    return this.recoveryCodeModel.findOne({ code: recoveryCode });
  }

  async deleteCode(recoveryCode: string) {
    const codeInstance = this.recoveryCodeModel.findOne({ code: recoveryCode });
    if (!codeInstance) return false;

    await codeInstance.deleteOne();
    return true;
  }
}
