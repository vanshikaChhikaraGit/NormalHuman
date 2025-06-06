import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { url } from "inspector";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from '@vercel/functions'
import axios from "axios";

export const GET = async(req:NextRequest)=>{
const {userId} = await auth()

if(!userId){
    return new Response('Unauthorized', { status: 401 });
}

const params = req.nextUrl.searchParams;
const code = params.get('code');
console.log("code:",code)
if (!code) {
    return new Response('Code not provided', { status: 404 });  
}else{
    console.log("code:",code)
}
const token = await exchangeCodeForAccessToken(code);

if (!token) {
    return new Response('Failed to exchange code for token', { status: 404 });
}else{
    console.log("token:",token)
}

const accountDetails = await getAccountDetails(token.accessToken);
if (!accountDetails) {
    return new Response('Failed to fetch account details', { status: 500 });
}else{
    console.log("accountDetails:",accountDetails)
}

await db.account.upsert({
    where:{
        id:token.accountId.toString()
    },
    update:{
        accessToken:token.accessToken
    },
    create:{
        userId,
        id:token.accountId.toString(),
        accessToken:token.accessToken,
        emailAddress: accountDetails.email,
        name: accountDetails.name
    }
})

//we'll trigger an intial email sync here in background which means that 
// emails would be synced in background and user would not have to wait at a 
// loading screen and would be immeditaely redirected to the /mail route page.

waitUntil(
    axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`,{
        accountId: token.accountId.toString(),
        userId
    })
    .then((response) => {
        console.log("Initial sync started successfully:", response.data);
    })
    .catch((error) => {
        console.error("Error starting initial sync:", error);
    })
)

return NextResponse.redirect(new URL('/mail',req.url))
}