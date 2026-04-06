import { z } from "zod";
export const userDtoSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(20),
    email: z.string().email(),
});
