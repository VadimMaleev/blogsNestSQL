import * as bcrypt from 'bcrypt';
import { UsersQueryRepository } from '../../repositories/users/users.query.repo';
import { CommandHandler } from '@nestjs/cqrs';

export class CheckCredentialsCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async execute(command: CheckCredentialsCommand) {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(
      command.loginOrEmail,
    );
    if (!user) return null;
    const isCompare = await bcrypt.compare(command.password, user.passwordHash);
    return isCompare ? user : null;
  }
}
