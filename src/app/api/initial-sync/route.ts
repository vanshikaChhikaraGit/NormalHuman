import Account from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { NextResponse } from "next/server";


export const POST = async(req:Request)=>{
    const { accountId,userId } = await req.json();

    if(!accountId || !userId) {
        console.log("accountId or userId is missing in the request body");
        return new Response('Invalid request', { status: 400 });
    }

    const dbAccount = await db.account.findUnique({
        where:{
            id:accountId,
            userId
        }
    })
    if(!dbAccount) {
        console.log("No account found with the provided accountId and userId");
        return new Response('Account not found', { status: 404 });
    }
const account = new Account(dbAccount.accessToken)
    const response = await account.performInitialSync()

    if(!response){
        console.log("No response received from performInitialSync");
        return NextResponse.json({error: "Failed to perform initial sync"}, { status: 500 });
    }

    const { emails,deltaToken } = response

    console.log('emails:',emails)
    console.log('sync completed!')

    await db.account.update({
        where:{
            id:accountId
        },
        data:{
            nextDeltaToken: deltaToken,
        }
    })
    await syncEmailsToDatabase(emails,accountId)

    return NextResponse.json({success:true}, { status: 200 });
    
}