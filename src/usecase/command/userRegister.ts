import type { IUserRepository } from "../../domain/model/user/IUserRepository.js";
import { User } from "../../domain/model/user/User.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";

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
export const registerUser = async (deps: Deps, input: Input) => {
  const user = User.create(crypto.randomUUID(), input.name, input.email);
  await deps.createUserRepository(deps.db).create(user);
  return user;
};
