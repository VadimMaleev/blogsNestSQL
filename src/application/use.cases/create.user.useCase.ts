import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersRepository } from '../../repositories/users/users.repo';
import { EmailAdapter } from '../../adapters/email-adapter';
import { UserCreateInputModelType } from '../../types/input.models';
import { CreateUserDto } from '../../types/dto';
import { CommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../services/auth.service';

export class CreateUserCommand {
  constructor(public user: UserCreateInputModelType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailAdapter: EmailAdapter,
    protected authService: AuthService,
  ) {}

  async execute(command: CreateUserCommand) {
    const hash = await this.authService.generateHash(command.user.password);
    const newUser = new CreateUserDto(
      uuidv4(),
      command.user.login,
      command.user.email,
      hash,
      new Date(),
      uuidv4(),
      add(new Date(), { hours: 3 }),
      false,
      false,
      null,
      'notBanned',
    );
    await this.usersRepository.createUser(newUser);
    await this.emailAdapter.sendEmailConfirmationCode(
      newUser.confirmationCode,
      newUser.email,
    );

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
      banInfo: {
        isBanned: newUser.isBanned,
        banDate: newUser.banDate,
        banReason: newUser.banReason,
      },
    };
  }
}
