import { User } from "../../domain/model/user/User.js";
import { userDtoSchema } from "../dto/userDto.js";
/**
 * ユーザーを登録
 */
export const registerUser = async (deps, input) => {
    const user = User.create(crypto.randomUUID(), input.name, input.email);
    await deps.createUserRepository(deps.db).create(user);
    const result = userDtoSchema.parse({
        id: user.id,
        name: user.name,
        email: user.email,
    });
    return result;
};
