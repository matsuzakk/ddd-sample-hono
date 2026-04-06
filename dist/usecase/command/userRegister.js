import { User } from "../../domain/model/user/User.js";
/**
 * ユーザーを登録
 */
export const registerUser = async (deps, input) => {
    const user = User.create(crypto.randomUUID(), input.name, input.email);
    await deps.createUserRepository(deps.db).create(user);
    return user;
};
