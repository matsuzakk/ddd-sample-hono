import { z } from "zod";
import { orderStatusValueSchema } from "./orderHistoryDto.js";
export const orderDtoSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    itemId: z.string().min(1),
    status: orderStatusValueSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
