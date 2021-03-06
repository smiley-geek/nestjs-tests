import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from 'src/users/entities/user.entity';
import {
  CREATE_USER_MUTATION,
  CREATE_USER_OPERATION_NAME,
  generateCreateUserVariables,
} from './helpers/create.user.helper';
import {
  generateGetUserVariable,
  GET_USER_OPERATION_NAME,
  GET_USER_QUERY,
} from './helpers/get.user.helper';

const GRAPHQL_ENDPOINT = '/graphql';
describe('Users resolver(e2e', () => {
  let app: INestApplication;
  let user: User;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create a user with user mutation', () => {
    const createUserInput = generateCreateUserVariables().createUserInput;
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        operationName: CREATE_USER_OPERATION_NAME,
        query: CREATE_USER_MUTATION,
        variables: { createUserInput },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.createUser).toBeDefined();
        user = res.body.data.createUser;

        expect(user._id).toBeDefined();
        expect(user.firstName).toBe(createUserInput.firstName);
        expect(user.lastName).toBe(createUserInput.lastName);
        expect(user.role).toBe(createUserInput.role);
      });
  });

  it('should get the user be the generated userId', () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        operationName: GET_USER_OPERATION_NAME,
        query: GET_USER_QUERY,
        variables: generateGetUserVariable(user._id.toString()),
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user._id).toBeDefined();
        expect(res.body.data.user.firstName).toBe(user.firstName);
        expect(res.body.data.user.lastName).toBe(user.lastName);
        expect(res.body.data.user.role).toBe(user.role);
      });
  });
});
