import { z } from 'zod';

const unitFields = {
  title: z.string().trim().min(1).max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers, and hyphens',
    ),
  description: z.string().trim().max(2000).nullable().optional(),
  sortingOrder: z.number().int().min(0).max(1_000_000).optional(),
};

export const createUnitSchema = z.object(unitFields);
export type CreateUnitDto = z.infer<typeof createUnitSchema>;

export const updateUnitSchema = z
  .object(unitFields)
  .partial()
  .refine((unit) => Object.keys(unit).length > 0, {
    message: 'At least one unit field must be provided',
  });
export type UpdateUnitDto = z.infer<typeof updateUnitSchema>;

export const unitIdSchema = z.string().cuid();
export const unitSubjectIdSchema = z.string().cuid();
