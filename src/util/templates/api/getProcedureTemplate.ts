export const getProcedureTemplate = (routeName: string) => `
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import * as ${routeName}Inputs from './${routeName}.inputs';
import * as ${routeName}Service from './${routeName}.service';

export const ${routeName}Router = createTRPCRouter({
    getById: protectedProcedure.input(${routeName}Inputs.getByIdInputSchema).query(({ input, ctx }) => {
        return ${routeName}Service.getById(input, ctx);
    }),
});
`;