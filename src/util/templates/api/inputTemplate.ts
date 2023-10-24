export const inputTemplate = `
import { z } from 'zod';

export const getByIdInputSchema = z.object({
    id: z.string(),
});
export type GetByIdInput = z.infer<typeof getByIdInputSchema>;
`;
