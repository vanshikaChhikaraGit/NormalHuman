import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Pencil } from "lucide-react"

import React from 'react'
import EmailEditor from "./email-editor"

const ComposeButton = () => {
    const [subject,setSubject] = React.useState<string>('')
    const [toValues,setToValues] = React.useState<{ label:string, value:string }[]>([])
    const [ccValues,setCcValues] = React.useState<{ label:string, value:string }[]>([])
    
    const handleSend = ()=>{}
  return (
    <div>
        <Drawer>
  <DrawerTrigger>
    <Button
    className=""
    
    >
        <Pencil className="size-4 mr-1"></Pencil>
        Compose
    </Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Compose Email</DrawerTitle>
       </DrawerHeader>
   <EmailEditor
   toValues={toValues}
   setToValues={setToValues}
   ccValues={ccValues}
   setCcValues={setCcValues}
   subject={subject}
   setSubject={setSubject}

   to = {toValues.map(to=>to.value)}
   defaultToolbarExpanded={true}
   handleSend={handleSend}
   isSending={false}
   ></EmailEditor>
  </DrawerContent>
</Drawer>
    </div>
  )
}

export default ComposeButton