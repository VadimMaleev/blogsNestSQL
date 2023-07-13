export const mapCommentsForBlog = (obj, userId: string) => {
  let myStatus = 'None';
  let likesCount = 0;
  let dislikesCount = 0;

  obj.likesInfo.forEach((like) => {
    if (like.userId === userId) {
      myStatus = like.status;
    }

    if (like.status === 'like') {
      likesCount += 1;
    }

    if (like.status === 'dislike') {
      dislikesCount += 1;
    }
  });

  return {
    id: obj.id,
    content: obj.content,
    createdAt: obj.createdAt,
    commentatorInfo: {
      userId: obj.userId,
      userLogin: obj.userLogin,
    },
    likesInfo: {
      likesCount,
      dislikesCount,
      myStatus,
    },
    postInfo: {
      id: obj.postInfo.id,
      title: obj.postInfo.title,
      blogId: obj.postInfo.blogId,
      blogName: obj.postInfo.blogName,
    },
  };
};
