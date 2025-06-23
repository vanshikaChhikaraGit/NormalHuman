import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";
import { emailAddressSchema } from "@/lib/types";
import Account from "@/lib/account";

const authoriseAccountAccess = async (accountId: string, userId: string) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      accessToken: true,
      name: true,
    },
  });

  if (!account) throw new Error("Account not found");

  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
      },
    });
  }),

  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId,ctx.auth.userId)

        let filter : Prisma.ThreadWhereInput = {}

        if(input.tab==='inbox'){
            filter.inboxStatus=true
        }else if(input.tab==='drafts'){
            filter.draftStatus=true
        }else if(input.tab==='sent'){
            filter.sentStatus=true
        }

        return await ctx.db.thread.count({
            where:{
               accountId:account.id,
                ...filter
            }
        })
    }),

    getThreads : privateProcedure.input(
      z.object({
      accountId:z.string(),
      tab:z.string(),
      done:z.boolean()
    })).query(async({ctx,input})=>{
      const account = await authoriseAccountAccess(input.accountId,ctx.auth.userId)

        let filter : Prisma.ThreadWhereInput = {}

        if(input.tab==='inbox'){
            filter.inboxStatus=true
        }else if(input.tab==='drafts'){
            filter.draftStatus=true
        }else if(input.tab==='sent'){
            filter.sentStatus=true
        }

        filter.done = {
          equals: input.done
        }

        return await ctx.db.thread.findMany({
          where:filter,
          //join with emails table
          include:{
            emails:{
              orderBy:{
                sentAt:'desc'
              },
              select:{
                from:true,
                body:true,
                bodySnippet:true,
                emailLabel:true,
                subject:true,
                sysLabels:true,
                id:true,
                sentAt:true
              }
            }
          },
          take: 15,
          orderBy:{
            lastMessageDate:'desc'
          }
        })
    }),

    getSuggestions: privateProcedure.input(
      z.object({
      accountId:z.string()
    })).query(async({ctx,input})=>{
      const account = await authoriseAccountAccess(input.accountId,ctx.auth.userId)
      return await ctx.db.emailAddress.findMany({
        where:{
          accountId:account.id
        },
        select:{
          address:true,
          name:true
        }
      })
    }),

    getReplyDetails: privateProcedure.input(
      z.object({
      accountId:z.string(),
      threadId:z.string()
    })).query(async({ctx,input})=>{
      const account = await authoriseAccountAccess(input.accountId,ctx.auth.userId)
      const thread = await ctx.db.thread.findFirst({
        where:{
          id:input.threadId
        },
        include:{
          emails:{
            orderBy:{sentAt:'asc'},
            select:{
              subject:true,
              from:true,
              to:true,
              cc:true,
              bcc:true,
              sentAt:true,
              internetMessageId:true
            }
          }
        }
      })
      if(!thread||thread.emails.length===0)throw new Error('Thread Not Found')
      
        const lastExternalEmail = thread.emails.reverse().find(email=>email.from.id!==account.id)
        if(!lastExternalEmail) throw new Error('No External Email Found')

        return {
          subject:lastExternalEmail.subject,
          to: [lastExternalEmail.from,...lastExternalEmail.to.filter(to=>to.address!==account.emailAddress)],
          cc: lastExternalEmail.cc.filter(cc=>cc.address!==account.emailAddress),
          from: { name:account.name,address:account.emailAddress },
          id:lastExternalEmail.internetMessageId
        }
    }),

    sendEmail: privateProcedure.input(
      z.object({
        accountId:z.string(),
        body:z.string(),
        subject:z.string(),
        from:emailAddressSchema,
        cc:z.array(emailAddressSchema).optional(),
        bcc:z.array(emailAddressSchema).optional(),
        to:z.array(emailAddressSchema),

        replyTo:emailAddressSchema,
        inReplyTo:z.string().optional(),
        threadId:z.string().optional()
      })
    ).mutation(async ({ ctx,input })=>{
      const account = await authoriseAccountAccess(input.accountId,ctx.auth.userId)
      const acc = new Account(account.accessToken)
      await acc.sendEmail({
        body:input.body,
        subject:input.subject,
        from:input.from,
        to:input.to,
        cc:input.cc,
        bcc:input.bcc,
        replyTo:input.replyTo,
        inReplyTo:input.inReplyTo,
        threadId:input.threadId
      })
    })


});
