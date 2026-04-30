import { User } from "../../domain/model/user/User.js";
import type { AuthInstance } from "../../infrastructure/auth/index.js";
import { userDtoSchema, type UserDto } from "../dto/userDto.js";

type Deps = {
  readonly auth: AuthInstance;
};

type Input = {
  readonly name: string;
  readonly email: string;
  readonly password: string;
};

/**
 * ユーザーを登録（better-auth メール＋パスワード）
 */
export const registerUser = async (
  deps: Deps,
  input: Input,
): Promise<UserDto> => {
  User.create("placeholder", input.name, input.email);

  const result = await deps.auth.api.signUpEmail({
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
    },
  });

  const createdUser = result.user;
  return userDtoSchema.parse({
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
  });
};
