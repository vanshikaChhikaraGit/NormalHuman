import { createTRPCRouter, privateProcedure } from "../trpc";

export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async({ctx})=>{

        return await ctx.db.account.findMany({
            where:{
                userId:ctx.auth.userId
            },
            select:{
                id:true,
                name:true,
                emailAddress:true
            }
        })

    })
})