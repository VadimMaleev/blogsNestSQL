import { BlogDocument } from '../repositories/blogs/blogs.schema';

export const mapBlogsForAdmin = (blog: BlogDocument) => ({
  id: blog.id,
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
  blogOwnerInfo: {
    userId: blog.userId,
    userLogin: blog.login,
  },
  banInfo: {
    isBanned: blog.isBanned,
    banDate: blog.banDate,
  },
});
