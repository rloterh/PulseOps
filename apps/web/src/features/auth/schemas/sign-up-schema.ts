import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.email().trim(),
  password: z.string().min(8).max(72),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
