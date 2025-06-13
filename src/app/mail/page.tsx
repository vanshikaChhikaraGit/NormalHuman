'use client'

import { ModeToggle } from '@/components/ui/mode-toggle'
import dynamic from 'next/dynamic'
import React from 'react'
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
        <ModeToggle></ModeToggle>
      </div>
      <Mail 
      defaultLayout={[20, 32, 48]} 
      navCollapsedSize={4} 
      defaultCollapsed={false} />
    </div>
  )
}

export default MailDashboard