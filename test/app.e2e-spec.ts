import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { agent as request } from 'supertest';
import { AppModule } from '../src/app.module';

let app: INestApplication;

let token = '';
let token2 = '';
let userId = '';
let userId2 = '';
let blogId = '';
let postId = '';
let commentId = '';

const blog = {
  name: 'blogName',
  description: 'blogDesc',
  websiteUrl: 'www.test.com',
};

const user = {
  login: 'loginTEST',
  email: 'testingbyme@gmail.com',
  password: '123TEST',
};

const user2 = {
  login: 'login222TEST',
  email: 'testing222byme@gmail.com',
  password: '123TEST',
};

const loginUser = {
  loginOrEmail: 'loginTEST',
  password: '123TEST',
};

const loginUser2 = {
  loginOrEmail: 'login222TEST',
  password: '123TEST',
};

const newBlog = {
  name: 'new blog',
  description: 'new blog',
  websiteUrl: 'testblogs.by',
};
const newPostForBlog = {
  title: 'titlePost',
  shortDescription: 'shortForPost',
  content: 'content for Post',
};
const banUser = {
  isBanned: true,
  banReason: 'ban for test',
};
const unbanUser = {
  isBanned: false,
  banReason: null,
};

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

describe('check ban unban user and visibility of posts', () => {
  it('delete all data', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/testing/all-data',
    );
    expect(response.status).toBe(204);
  });

  it('should creat new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/sa/users')
      .send(user)
      .set(
        'Authorization',
        'Basic ' + new Buffer('admin:qwerty').toString('base64'),
      );
    userId = response.body.id;
    expect(response).toBeDefined();
    expect(response.status).toBe(201);
    expect(response.body.login).toBe(user.login);
    expect(response.body.email).toBe(user.email);
  });

  it('should creat new user2', async () => {
    const response = await request(app.getHttpServer())
      .post('/sa/users')
      .send(user2)
      .set(
        'Authorization',
        'Basic ' + new Buffer('admin:qwerty').toString('base64'),
      );
    userId2 = response.body.id;
    expect(response).toBeDefined();
    expect(response.status).toBe(201);
    expect(response.body.login).toBe(user2.login);
    expect(response.body.email).toBe(user2.email);
  });

  describe('login user', () => {
    it('login - should return 200 status', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUser)
        .set('user-agent', 'test');
      token = response.body.accessToken;
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });
  });

  describe('login user2', () => {
    it('login - should return 200 status', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUser2)
        .set('user-agent', 'test');
      token2 = response.body.accessToken;
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
    });
  });

  describe('create new blog', () => {
    it('should create new blog', async () => {
      const response = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .send(newBlog)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(201);
      blogId = response.body.id;
    });
    it('should create new blog', async () => {
      const response = await request(app.getHttpServer())
        .get('/blogger/blogs')
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(200);
      expect(response.body.items[0].name).toBe(newBlog.name);
    });
  });

  describe('create new post and comment', () => {
    it('should create new post', async () => {
      const response = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blogId}/posts`)
        .send(newPostForBlog)
        .set('Authorization', 'Bearer ' + token);
      expect(response.status).toBe(201);
      postId = response.body.id;
    });

    it('should return created post', async () => {
      const response = await request(app.getHttpServer()).get(
        `/posts/${postId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body.title).toBe(newPostForBlog.title);
    });

    it('should creat new comment by user 2', async () => {
      const response = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .send({ content: 'new comment by User2' })
        .set('Authorization', 'Bearer ' + token2);
      expect(response.status).toBe(201);
      commentId = response.body.id;
    });

    it('should return created comment', async () => {
      const response = await request(app.getHttpServer()).get(
        `/comments/${commentId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(commentId);
    });
  });

  describe('ban user2 and check post', () => {
    it('should ban user2', async () => {
      const response = await request(app.getHttpServer())
        .put(`/sa/users/${userId2}/ban`)
        .set(
          'Authorization',
          'Basic ' + new Buffer('admin:qwerty').toString('base64'),
        )
        .send(banUser);
      expect(response.status).toBe(204);
    });
    it(`should return created post`, async () => {
      const response = await request(app.getHttpServer()).get(
        `/posts/${postId}`,
      );
      expect(response.status).toBe(200);
    });
  });

  describe('unban user and check post', () => {
    it('should unban user', async () => {
      const response = await request(app.getHttpServer())
        .put(`/sa/users/${userId}/ban`)
        .set(
          'Authorization',
          'Basic ' + new Buffer('admin:qwerty').toString('base64'),
        )
        .send(unbanUser);
      expect(response.status).toBe(204);
    });
    it(`shouldn't return created post`, async () => {
      const response = await request(app.getHttpServer()).get(
        `/posts/${postId}`,
      );
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body.title).toBe(newPostForBlog.title);
    });
  });
});
