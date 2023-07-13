import { UserDocument } from '../repositories/users/users.schema';
import { UsersForResponse } from '../types/types';

export const mapUsersForResponse = (user: UserDocument): UsersForResponse => ({
  id: user.id,
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
  banInfo: {
    isBanned: user.isBanned,
    banDate: user.banDate,
    banReason: user.banReason,
  },
});
