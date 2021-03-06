import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ListUsersInput } from './dto/page-data.dto';
import { ListUsersResponse } from './dto/list-users.response';
import ConnectionArgs, {
  getPagingParameters,
} from '../common/relay/connection.args';
import { connectionFromArraySlice } from 'graphql-relay';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'listUsersWithLimitAndOffset' })
  findAll(@Args('listUsersInput') listUsersInput: ListUsersInput) {
    return this.usersService.findAll(listUsersInput);
  }
  @Query(() => ListUsersResponse, { name: 'listUsersWithCursor' })
  async findAllWithCursor(
    @Args('args') args: ConnectionArgs,
  ): Promise<ListUsersResponse> {
    const { limit, offset } = getPagingParameters(args);
    const { users, count } = await this.usersService.findAllWithCursor({
      limit,
      offset,
    });
    const page = connectionFromArraySlice(users, args, {
      arrayLength: count,
      sliceStart: offset || 0,
    });
    return { page, pageDat: { count, limit, offset } };
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => String }) id: string) {
    return this.usersService.remove(id);
  }
}
