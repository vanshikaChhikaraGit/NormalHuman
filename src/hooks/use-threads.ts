import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAtom,atom } from 'jotai'

export const threadIdAtom = atom<string|null>(null)

const useThread = ()=>{
const { data:accounts } = api.account.getAccounts.useQuery()
const [tab] = useLocalStorage('normalhuman-tab','inbox')
const [accountId] = useLocalStorage('accountId','')
const [done] = useLocalStorage('normalhuman-done',false)
const [threadId,setThreadId] = useAtom(threadIdAtom)

const { data:threads, isFetching,refetch } =  api.account.getThreads.useQuery({
tab,
done,
accountId
},{
    enabled:!!accountId&&!!tab, placeholderData:e=>e,refetchInterval:5000
})

return {
    threads,
    threadId,
    setThreadId,
    isFetching,
    refetch,
    accountId,
    account: accounts?.find(e=>e.id===accountId)
}
}

export default useThread;