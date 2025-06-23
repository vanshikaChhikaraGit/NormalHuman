import { api } from '@/trpc/react'
import { useRegisterActions } from 'kbar'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'

const useAccountSwitching = () => {
    const { data:accounts } = api.account.getAccounts.useQuery()

    const mainAction = [{
        id:'accountsAction',
        name:'Switch Account',
        shortcut:['e','s'],
        section:'Accounts'
    }]

    const [_,setAccountId] = useLocalStorage('accountId','');

    useRegisterActions(mainAction.concat((accounts?.map(account=>{
        return {
            id:account.id,
            name:account.name,
            parent:'accountsAction',
            perform:()=>{
                setAccountId(account.id)
            },
            keywords:[
                account.name,
                account.emailAddress
            ].filter(Boolean)as string[],
            shortcut:[],
            section:'Accounts'

        }
    }))||[]),[accounts])
  
}

export default useAccountSwitching