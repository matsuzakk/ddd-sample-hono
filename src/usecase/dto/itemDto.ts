import { z } from "zod";

export const itemStatusValueSchema = z.union([z.literal(0), z.literal(1)]);

export const itemDtoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(20),
  description: z.string().min(1).max(1000),
  price: z.number().int().min(0).max(999_999),
  status: itemStatusValueSchema,
  sellerId: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ItemDto = z.infer<typeof itemDtoSchema>;
