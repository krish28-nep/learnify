import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  password: z.string().min(8).max(128),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});
export type SignInType = z.infer<typeof signInSchema>;
