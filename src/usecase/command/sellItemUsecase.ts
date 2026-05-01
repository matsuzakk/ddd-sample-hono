import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { Item } from "../../domain/model/item/Item.js";
import { ItemDescription } from "../../domain/model/item/vo/ItemDescription.js";
import { ItemName } from "../../domain/model/item/vo/ItemName.js";
import { ItemPrice } from "../../domain/model/item/vo/ItemPrice.js";
import { ItemStatus } from "../../domain/model/item/vo/ItemStatus.js";
import { NotFoundError } from "../../domain/model/shared/error.js";
import type { IUserRepository } from "../../domain/model/user/IUserRepository.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
  readonly createUserRepository: (client: DbClient) => IUserRepository;
};

type Input = {
  readonly sellerId: number;
  readonly name: string;
  readonly description: string;
  readonly price: number;
};

export const sellItemUsecase = (deps: Deps, input: Input): ItemDto => {
  const userRepository = deps.createUserRepository(deps.db);

  const seller = userRepository.findById(input.sellerId);

  if (!seller || seller.id === null) {
    throw new NotFoundError("Seller not found");
  }

  const itemRepository = deps.createItemRepository(deps.db);
  const item = Item.create(
    input.name,
    input.description,
    ItemPrice.create(input.price),
    seller.id,
  );
  const id = itemRepository.create(item);

  const result = itemDtoSchema.parse({
    id,
    name: ItemName.toValue(item.name),
    description: ItemDescription.toValue(item.description),
    price: ItemPrice.toValue(item.price),
    status: ItemStatus.toValue(item.status),
    sellerId: item.sellerId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
  return result;
};
