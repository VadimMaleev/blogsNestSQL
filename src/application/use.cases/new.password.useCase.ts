import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { NewPasswordInputModelType } from '../../types/input.models';
import { RecoveryCodeRepository } from '../../repositories/recovery.codes/recovery.code.repo';
import { UsersRepository } from '../../repositories/users/users.repo';

export class NewPasswordCommand {
  constructor(public inputModel: NewPasswordInputModelType) {}
}

@Injectable()
export class NewPasswordUseCase {
  constructor(
    protected recoveryCodeRepository: RecoveryCodeRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: NewPasswordCommand): Promise<boolean> {
    const code = await this.recoveryCodeRepository.findCode(
      command.inputModel.recoveryCode,
    );
    if (!code) return false;
    if (code.codeExpirationDate < new Date()) return false;

    const newPasswordHash = await bcrypt.hash(
      command.inputModel.newPassword,
      10,
    );

    await this.recoveryCodeRepository.deleteCode(
      command.inputModel.recoveryCode,
    );
    return await this.usersRepository.updatePassword(
      newPasswordHash,
      code.userId,
    );
  }
}
