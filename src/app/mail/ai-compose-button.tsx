import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Bot } from "lucide-react"

import React from 'react'
import { generateEmail } from "./action"
import { readStreamableValue } from "ai/rsc"
import useThread from "@/hooks/use-threads"
import { turndown } from "@/lib/turndown"

type Props = {
    isComposing: boolean,
    onGenerate: (token:string)=>void
}

const AIComposeButton = (props: Props) => {
    const [open, setOpen] = React.useState(false)
    const [prompt,setPrompt] = React.useState('')
    const { threads,threadId,account } = useThread()
    const thread = threads?.find(t=>t.id===threadId)

    const aiGenerate = async()=>{
      let context = ''

      if(!props.isComposing){
        for(const email of thread?.emails ?? []){
          const content = `
          Subject: ${email.subject}
          From:${email.from}
          Sent: ${new Date(email.sentAt).toLocaleString()}
          Body: ${turndown.turndown(email.body??email.bodySnippet??"")}
          `
          context+=content
        }
      }

      context+=`My name is ${account?.name} and my email id ${account?.emailAddress}`

      const { output } = await generateEmail(context,prompt)

      for await(const token of readStreamableValue(output)){
        if(token){
          console.log(token)
          props.onGenerate(token)
        }
      }
    }

  return (
    <div>
        <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>
    <Button size={'icon'} variant={'outline'} onClick={()=>setOpen(true)}>
        <Bot className="size-5"></Bot>
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>AI Smart Compose</DialogTitle>
      <DialogDescription>
        AI will help you compose your email.
      </DialogDescription>
      <div className="h-2"></div>
      <Textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder="Enter a prompt.">
      </Textarea>
      <div className="h-2"></div>
      <Button onClick={()=>{
        setPrompt('')
      setOpen(false)
        aiGenerate()
      }}>
        Compose
      </Button>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </div>
  )
}

export default AIComposeButton