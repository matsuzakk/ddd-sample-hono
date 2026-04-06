import type { IUserRepository } from "../../domain/model/user/IUserRepository.js";
import { User } from "../../domain/model/user/User.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { userDtoSchema, type UserDto } from "../dto/userDto.js";

export type Deps = {
  readonly db: AppDatabase;
  readonly createUserRepository: (client: DbClient) => IUserRepository;
};

export type Input = {
  readonly name: string;
  readonly email: string;
};

/**
 * ユーザーを登録
 */
export const registerUser = async (
  deps: Deps,
  input: Input,
): Promise<UserDto> => {
  const user = User.create(crypto.randomUUID(), input.name, input.email);
  await deps.createUserRepository(deps.db).create(user);

  const result = userDtoSchema.parse({
    id: user.id,
    name: user.name,
    email: user.email,
  });
  return result;
};
