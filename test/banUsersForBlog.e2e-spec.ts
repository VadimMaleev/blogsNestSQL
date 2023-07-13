import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { agent as request } from 'supertest';
import { AppModule } from '../src/app.module';

let app: INestApplication;

const blog = {
  name: 'blogName',
  description: 'blogDesc',
  websiteUrl: 'www.test.com',
};

const blog2 = {
  name: 'blogName222',
  description: 'blogDesc222',
  websiteUrl: 'www.test222.com',
};

const user2 = {
  login: 'login222TEST',
  email: 'testing222byme@gmail.com',
  password: '123TEST',
};

const userForBan = {
  login: 'login333TEST',
  email: 'testing333byme@gmail.com',
  password: '123TEST',
};

let userIdForBan = '';
let blogId2 = '';

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  await request(app.getHttpServer()).delete('/testing/all-data');
});

afterAll(async () => {
  await app.close();
});

describe('check ban unban user for blog', () => {
  let users = [];
  let blogIdForBanUsers = '';

  it('should create and login users', async () => {
    users = await createAndLoginSeveralUsers(5);
  });

  it('should create blog for user[0]', async () => {
    const blogRes = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .send(blog)
      .set('Authorization', 'Bearer ' + users[0].accessToken);
    blogIdForBanUsers = blogRes.body.id;
  });

  it('should ban users for blog', async () => {
    for (const banUser of users) {
      if (users[0].userId !== banUser.userId) {
        await request(app.getHttpServer())
          .put(`/blogger/users/${banUser.userId}/ban`)
          .send({
            isBanned: true,
            banReason: 'jestBan for tests',
            blogId: blogIdForBanUsers,
          })
          .set('Authorization', 'Bearer ' + users[0].accessToken);
      }
    }
  });

  it('should return banned users for blog', async () => {
    const res = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blogIdForBanUsers}?pageSize=50`)
      .set('Authorization', 'Bearer ' + users[0].accessToken);

    expect(res.status).toBe(200);
  });
  //from this
  it('should create new user for ban', async () => {
    const res = await request(app.getHttpServer())
      .post('/sa/users')
      .send(userForBan)
      .set(
        'Authorization',
        'Basic ' + new Buffer('admin:qwerty').toString('base64'),
      );
    expect(res).toBeDefined();
    expect(res.status).toBe(201);
    userIdForBan = res.body.id;
  });

  it('should create new blog2 for user[0]', async () => {
    const blogRes = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .send(blog2)
      .set('Authorization', 'Bearer ' + users[0].accessToken);
    blogId2 = blogRes.body.id;
  });

  it('should ban user3', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/users/${userIdForBan}/ban`)
      .send({
        isBanned: true,
        banReason: 'jestBan for tests',
        blogId: blogId2,
      })
      .set('Authorization', 'Bearer ' + users[0].accessToken);
  });

  it('should return one banned user for blog2', async () => {
    const res = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blogId2}?pageSize=50`)
      .set('Authorization', 'Bearer ' + users[0].accessToken);

    expect(res.status).toBe(200);
    const bannedUser = res.body.items.find((user) => user.id === userIdForBan);
    console.log(bannedUser);
    console.log(res.body);
    expect(bannedUser).not.toBeUndefined();
  });
});

const createAndLoginSeveralUsers = async (
  count: number,
): Promise<{ accessToken: string; userId: string }[]> => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await request(app.getHttpServer())
      .post('/sa/users')
      .send({ ...user2, login: user2.login + i, email: `email@emai${i}l.com` })
      .set(
        'Authorization',
        'Basic ' + new Buffer('admin:qwerty').toString('base64'),
      );
    users.push(user.body);
  }
  const tokens = [];

  for (const user of users) {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail: user.login, password: user2.password })
      .set('user-agent', 'test');
    tokens.push({ accessToken: response.body.accessToken, userId: user.id });
  }
  return tokens;
};
