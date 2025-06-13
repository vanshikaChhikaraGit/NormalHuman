import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { Nav } from './nav'
import { File, Inbox, Send } from 'lucide-react'
import { api } from '@/trpc/react'

type Props = {
    isCollapsed:boolean
}

const Sidebar = ({isCollapsed}: Props) => {
 const [accountId]= useLocalStorage('accountId','')
 const [tab] = useLocalStorage<'inbox' | 'drafts' | 'sent'>('normalhuman-tab','inbox')
   
 const inboxThreads = api.account.getNumThreads.useQuery({
    accountId: accountId,
    tab:'inbox'
 })
 const draftThreads = api.account.getNumThreads.useQuery({
    accountId: accountId,
    tab:'drafts'
 })
 const sentThreads = api.account.getNumThreads.useQuery({
    accountId: accountId,
    tab:'sent'
 })

 console.log(inboxThreads)

 return (
    <div> 
        <Nav
        isCollapsed={isCollapsed}
        links={[
            {
                title:'Inbox',
                label: inboxThreads?.data?.toString() ?? '0',
                icon:Inbox,
                variant: tab==='inbox'?'default':'ghost'
            },
            {
                title:'Drafts',
                label: draftThreads?.data?.toString() ?? '0',
                icon: File,
                variant: tab==='drafts'?'default':'ghost'
            },
            {
                title:'Sent',
                label: sentThreads?.data?.toString() ?? '0',
                icon: Send,
                variant: tab==='sent'?'default':'ghost'
            }
        ]}
        ></Nav>
    </div>
  )
}

export default Sidebar