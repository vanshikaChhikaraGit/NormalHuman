import { db } from "@/server/db";
import { EmailAddress, EmailAttachment, EmailMessage } from "./types"
import  pLimit from 'p-limit'
import { Prisma } from "@prisma/client";

export const syncEmailsToDatabase = async (emails: EmailMessage[], accountId: string) => {

    const limit = pLimit(5);

    try {
        for (const [index, email] of emails.entries()) {
                await upsertEmail(email, index, accountId);
        }
        console.log(`upserted ${emails.length} emails for account ${accountId}`);
    } catch (error) {
        console.log('error occured while upserting emails:',error)
    }

}

const upsertEmail = async (email:EmailMessage,index:number, accountId:string)=>{
    try {
        console.log(`Processing email ${index + 1}`);
        //find the label of email
        let emailLabelType: 'inbox' | 'draft' | 'sent' = 'inbox';

        if(email.sysLabels.includes('inbox')||email.sysLabels.includes('important')){
            emailLabelType='inbox'
        }else if(email.sysLabels.includes('draft')){
            emailLabelType='draft'
        }else if(email.sysLabels.includes('sent')){
            emailLabelType='sent'   
        }

        // find all unique email addresses linked in the input email
        const emailAddressesToUpsert = new Map()
        for(const address of [email.from,...email.to,...email.cc,...email.bcc,...email.replyTo]){
            emailAddressesToUpsert.set(address.address,address)
        } 

        const upsertedAddresses: (Awaited<ReturnType <typeof upsertEmailAddress>> | null)[] = []

        for(const address of emailAddressesToUpsert.values()){
           //upsert the email addresses and store the returned db record to further do the data mapping with the db feild ids returned
            const upsertedAddress = await upsertEmailAddress(address,accountId)
            upsertedAddresses.push(upsertedAddress)
        }

        // convert upserted addresses to a map for easy access and O(1) lookup
        const addressMap = new Map(upsertedAddresses.filter(Boolean).map(address=>[address!.address,address]))

        //extract the email addresses from the map
        const fromAddress = addressMap.get(email.from.address)
        if(!fromAddress){
            console.log(`failed to extract from address for ${email.bodySnippet}`)
            return;
        }

        const toAddresses = email.to.map(addr=> addressMap.get(addr.address))
        const ccAddresses = email.cc.map(addr=> addressMap.get(addr.address))
        const bccAddresses = email.bcc.map(addr=> addressMap.get(addr.address))
        const replyToAddresses = email.replyTo.map(addr=> addressMap.get(addr.address))
        
        //upsert thread 
        const thread = await db.thread.upsert({
            where: { id: email.threadId },
            update: {
                subject: email.subject,
                accountId,
                lastMessageDate: new Date(email.sentAt),
                done: false,
                participantIds: [...new Set([
                    fromAddress.id,
                    ...toAddresses.map(a => a!.id),
                    ...ccAddresses.map(a => a!.id),
                    ...bccAddresses.map(a => a!.id)
                ])]
            },
            create: {
                id: email.threadId,
                accountId,
                subject: email.subject,
                done: false,
                draftStatus: emailLabelType === 'draft',
                inboxStatus: emailLabelType === 'inbox',
                sentStatus: emailLabelType === 'sent',
                lastMessageDate: new Date(email.sentAt),
                participantIds: [...new Set([
                    fromAddress.id,
                    ...toAddresses.map(a => a!.id),
                    ...ccAddresses.map(a => a!.id),
                    ...bccAddresses.map(a => a!.id)
                ])]
            }
        });
        
         // 3. Upsert Email
        await db.email.upsert({
            where: { id: email.id },
            update: {
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { set: toAddresses.map(a => ({ id: a!.id })) },
                cc: { set: ccAddresses.map(a => ({ id: a!.id })) },
                bcc: { set: bccAddresses.map(a => ({ id: a!.id })) },
                replyTo: { set: replyToAddresses.map(a => ({ id: a!.id })) },
                hasAttachments: email.hasAttachments,
                internetHeaders: email.internetHeaders as any,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                omitted: email.omitted,
                emailLabel: emailLabelType,
            },
            create: {
                id: email.id,
                emailLabel: emailLabelType,
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                internetHeaders: email.internetHeaders as any,
                keywords: email.keywords,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: { connect: toAddresses.map(a => ({ id: a!.id })) },
                cc: { connect: ccAddresses.map(a => ({ id: a!.id })) },
                bcc: { connect: bccAddresses.map(a => ({ id: a!.id })) },
                replyTo: { connect: replyToAddresses.map(a => ({ id: a!.id })) },
                hasAttachments: email.hasAttachments,
                body: email.body,
                bodySnippet: email.bodySnippet,
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                omitted: email.omitted,
            }
        });

        const threadEmails = await db.email.findMany({
            where: { threadId: thread.id },
            orderBy: { receivedAt: 'asc' }
        });

        let threadFolderType = 'sent';
        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === 'inbox') {
                threadFolderType = 'inbox';
                break; // If any email is in inbox, the whole thread is in inbox
            } else if (threadEmail.emailLabel === 'draft') {
                threadFolderType = 'draft'; // Set to draft, but continue checking for inbox
            }
        }
        await db.thread.update({
            where: { id: thread.id },
            data: {
                draftStatus: threadFolderType === 'draft',
                inboxStatus: threadFolderType === 'inbox',
                sentStatus: threadFolderType === 'sent',
            }
        });

          // 4. Upsert Attachments
        for (const attachment of email.attachments) {
            await upsertAttachment(email.id, attachment);
        }
    } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(`Prisma error for email ${email.id}: ${error.message}`);
        } else {
            console.log(`Unknown error for email ${email.id}: ${error}`);
        }
    }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
    try {
        await db.emailAttachment.upsert({
            where: { id: attachment.id ?? "" },
            update: {
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            },
            create: {
                id: attachment.id,
                emailId,
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            },
        });
    } catch (error) {
        console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
    }
}

const upsertEmailAddress = async (address:EmailAddress,accountId:string)=>{
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where:{
                accountId_address:{
                    accountId,
                    address: address.address ?? ''
                }
            }
        })
        if(existingAddress){
            return await db.emailAddress.findUnique({
                where:{
                    id: existingAddress.id
                }
            })
        }else{
            return await db.emailAddress.create({
                data:{
                    accountId,
                    raw: address.raw ,
                    name:address.name,
                    address:address.address ?? '',
                }
            })
        }
    } catch (error) {
        console.log('error while upserting the addresses to databases initially the first step',error)
    }
}