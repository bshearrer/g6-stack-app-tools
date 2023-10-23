export const serviceTemplate = (routeName: string) => `
import { type ProtectedTRPCContext } from '../../trpc';
import { type GetByIdInput } from './${routeName}.inputs';

export const getById = (input: GetByIdInput, _ctx: ProtectedTRPCContext) => {
	return input;
};
`;
