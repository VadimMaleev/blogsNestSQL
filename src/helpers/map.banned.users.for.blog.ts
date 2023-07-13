import { BannedUsersForBlogDocument } from '../repositories/users/banned.users.for.blog.schema';

export const mapBannedUsersForBlog = (
  bannedUser: BannedUsersForBlogDocument,
) => ({
  id: bannedUser.userId,
  login: bannedUser.login,
  banInfo: {
    isBanned: bannedUser.isBanned,
    banDate: bannedUser.banDate,
    banReason: bannedUser.banReason,
  },
});
