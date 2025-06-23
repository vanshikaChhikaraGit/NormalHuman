'use client'

import { ModeToggle } from '@/components/ui/mode-toggle'
import { UserButton } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import React from 'react'
import ComposeButton from './compose-button'
// import Mail from './mail'

const Mail = dynamic(()=>{
  return import('./mail')
},{
  ssr:false
})

const MailDashboard = () => {
  return (
    <div>
      <div className="absolute bottom-4 left-4">
        <div className="flex-col md:items-center md:flex-row">
          <div className='mb-1'><UserButton></UserButton></div>
          <div className='mb-1'><ModeToggle></ModeToggle></div>
          <div className='mb-1'><ComposeButton></ComposeButton></div>
        </div>
       
      </div>
      <Mail 
      defaultLayout={[20, 32, 48]} 
      navCollapsedSize={4} 
      defaultCollapsed={false} />
    </div>
  )
}

export default MailDashboard