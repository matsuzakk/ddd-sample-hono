import { z } from "zod";
import { orderStatusValueSchema } from "./orderHistoryDto.js";

export const orderDtoSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  status: orderStatusValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type OrderDto = z.infer<typeof orderDtoSchema>;
