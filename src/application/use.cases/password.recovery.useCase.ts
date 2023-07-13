import { Injectable } from '@nestjs/common';
import { RecoveryCodeDto } from '../../types/dto';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { EmailAdapter } from '../../adapters/email-adapter';
import { RecoveryCodeRepository } from '../../repositories/recovery.codes/recovery.code.repo';

export class PasswordRecoveryCommand {
  constructor(public userId: string, public email: string) {}
}

@Injectable()
export class PasswordRecoveryUseCase {
  constructor(
    protected emailAdapter: EmailAdapter,
    protected recoveryCodeRepository: RecoveryCodeRepository,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const code = uuidv4();
    const recoveryCode = new RecoveryCodeDto(
      code,
      add(new Date(), { hours: 3 }),
      command.userId,
    );
    await this.recoveryCodeRepository.createRecoveryCode(recoveryCode);
    await this.emailAdapter.passwordRecovery(code, command.email);
  }
}
