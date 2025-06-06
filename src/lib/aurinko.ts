"use server"

import { auth } from "@clerk/nextjs/server"
import   axios, { Axios }  from "axios"
import { redirect } from "next/dist/server/api-utils"
export const getAurinkoAuthUrl = async(serviceType:'Google'|'Office365')=>{

    try {
        const user = await auth()
        if(!user){
            throw new Error("User not authorized")
        }

        const params = new URLSearchParams({
            clientId:process.env.AURINKO_CLIENT_ID as string,
            serviceType,
            scopes:'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
            responseType:'code',
            returnUrl:`${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
            redirect_uri:`${process.env.NEXT_PUBLIC_URL}/api/intermediate/redirect`,
        })

        return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`
    } catch (error) {
        console.log(error)
        throw new Error(`an error occured while getting the aurinko auth url ${error}`)
    }

}

export const exchangeCodeForAccessToken = async(code:string)=>{
    try {
         const accessCode = encodeURIComponent(code)
       
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${accessCode}`, {},{
            auth:{
                username:process.env.AURINKO_CLIENT_ID as string,
                password:process.env.AURINKO_CLIENT_SECRET as string,
            }
        })

        return response.data as {
            accountId: number;
            accessToken: string;
            userId: string;
            userSession:string;
        }

    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log("error:",error)
            console.log({status: error.response?.status,
                data: error.response,
                requestUrl: error.config?.url})
            console.error('Axios error:', error.response?.data || error.message,{status: error.response?.status,
                data: error.response?.data,
                requestUrl: error.config?.url});
              }else{
                console.log(error)
            console.error('Unexpected error:', error);
              }
    }
}



export const getAccountDetails = async(accessToken:string)=>{
    try {
        const response = await axios.get('https://api.aurinko.io/v1/account', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return response.data as {
            email: string;
            name: string;
        };
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.error('Axios error:', error.response?.data || error.message);
             }else{
            console.error('Unexpected error:', error);
                  }
    }
}