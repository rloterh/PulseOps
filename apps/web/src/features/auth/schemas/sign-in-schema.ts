import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(8).max(72),
  next: z.string().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
