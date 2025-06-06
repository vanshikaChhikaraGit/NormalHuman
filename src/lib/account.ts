import axios from "axios";
import { SyncResponse, SyncUpdatedResponse } from "./types";
import { EmailMessage } from "./types";

class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync() {
    try {
      const response = await axios.post<SyncResponse>(
        "https://api.aurinko.io/v1/email/sync",
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            daysWithin: 2,
            
            bodyType: "html",
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  }

  async getUpdatedEmails({deltaToken,pageToken}:{deltaToken?:string, pageToken?:string}) {
    try {
        let params :Record<string,string> = {}
        if(deltaToken){
            params.deltaToken = deltaToken;
        }
        if(pageToken){
            params.pageToken = pageToken;
        }

        const response = await axios.get<SyncUpdatedResponse>(
            "https://api.aurinko.io/v1/email/sync/updated",
            {
                headers:{
                    Authorization: `Bearer ${this.token}`,
                },
                params
            }
        )

        return response.data

    } catch (error) {
        if(axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data || error.message);
        }
        else {
            console.error("Unexpected error:", error);
        }
    }
  }

  async performInitialSync() {
    try {
        //start initial sync process
        let syncResponse = await this.startSync();
        while(!syncResponse?.ready){
             await new Promise((resolve)=>{setTimeout(resolve, 1000)});
           syncResponse = await this.startSync(); 
        }

        // call the /email/sync/updated endpoint with the initail bookmark delta token we recieved 
        //so that further we can get all the emails in batches with the help pf page tokens

        let storedDeltaToken : string = syncResponse.syncUpdatedToken

        let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken});

        if(updatedResponse?.nextDeltaToken){
            storedDeltaToken = updatedResponse.nextDeltaToken;
        }
        let allEmails : EmailMessage[] = []
       
        if(updatedResponse?.records){
            allEmails = updatedResponse.records;
        } 

        while(updatedResponse?.nextPageToken){
            updatedResponse = await this.getUpdatedEmails({pageToken:updatedResponse.nextPageToken})
            if(updatedResponse?.records){
                allEmails = allEmails.concat(updatedResponse.records);
            }
            if(updatedResponse?.nextDeltaToken){
                storedDeltaToken = updatedResponse.nextDeltaToken
            }
        }

        console.log('initial sync completed, total emails fetched:', allEmails.length);

        return {
            emails: allEmails,
            deltaToken: storedDeltaToken
        }

    } catch (error) {
        console.log(error)
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data || error.message);
        } else {
            console.error("Unexpected error:", error);
        }
    }
  }
}

export default Account;