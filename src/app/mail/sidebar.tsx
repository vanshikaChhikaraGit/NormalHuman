import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { Nav } from './nav'
import { File, Inbox, Send } from 'lucide-react'

type Props = {
    isCollapsed:boolean
}

const Sidebar = ({isCollapsed}: Props) => {
 const [accountId]= useLocalStorage('accountId','')
 const [tab] = useLocalStorage<'inbox' | 'drafts' | 'sent'>('normalhuman-tab','inbox')
    return (
    <div> 
        <Nav
        isCollapsed={isCollapsed}
        links={[
            {
                title:'Inbox',
                label: '3',
                icon:Inbox,
                variant: tab==='inbox'?'default':'ghost'
            },
            {
                title:'Drafts',
                label: '4',
                icon: File,
                variant: tab==='drafts'?'default':'ghost'
            },
            {
                title:'Sent',
                label: '4',
                icon: Send,
                variant: tab==='sent'?'default':'ghost'
            }
        ]}
        ></Nav>
    </div>
  )
}

export default Sidebar