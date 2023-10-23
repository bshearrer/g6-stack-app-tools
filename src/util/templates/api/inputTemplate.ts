export const inputTemplate = `
import { z } from 'zod';

export const getByIdInput = z.object({
    id: z.string(),
});
export type GetByIdInput = z.infer<typeof getByIdInput>;
`;
