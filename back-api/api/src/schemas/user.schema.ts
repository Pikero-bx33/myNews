import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const paramsSchema = z.object({
  id: z.string().min(1),
});

