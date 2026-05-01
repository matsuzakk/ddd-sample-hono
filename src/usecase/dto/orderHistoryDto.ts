import { z } from "zod";

export const orderStatusValueSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const orderHistoryDtoSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  fromStatus: orderStatusValueSchema.nullable(),
  toStatus: orderStatusValueSchema,
  createdAt: z.coerce.date(),
});

export type OrderHistoryDto = z.infer<typeof orderHistoryDtoSchema>;
