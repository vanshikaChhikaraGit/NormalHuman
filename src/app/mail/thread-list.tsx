import useThread from '@/hooks/use-threads'
import React, { ComponentProps } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import  DOMPurify  from 'dompurify'
import { cn } from '@/lib/utils'
import { motion,AnimatePresence } from 'framer-motion'

const ThreadList = () => {
    const {threads,threadId,setThreadId} = useThread()
//     const [threadId, setThreadId] = useThread();
//   const [parent] = useAutoAnimate(/* optional config */);
//   const { selectedThreadIds, visualMode } = useVim();
    //group threads by date
    const groupedThreads = threads?.reduce((acc,thread)=>{
        const date = format(thread.emails[0]?.sentAt??new Date(),'yyyy-MM-dd')
        if(!acc[date]){
            acc[date] = []
        }
        acc[date].push(thread)
        return acc
    },{} as Record<string,typeof threads>)
  return (
    <div className='max-w-full overflow-y-scroll custom-scrollbar max-h-[calc(100vh-120px)]'>
        <div className="flex flex-col gap-2 p-4 pt-0">
            {Object.entries(groupedThreads??{}).map(([date,threads])=>{
                return <React.Fragment key={date}>
                    <div className="text-xs font-medium text-muted-foreground mt-5 first:mt-0">
                        {date}
                    </div>
                     {threads.map((item) => (
              <button
                id={`thread-${item.id}`}
                key={item.id}
                className={cn(
                  "flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all relative",
                  {'bg-accent': threadId===item.id}
                  //   visualMode &&
                //   selectedThreadIds.includes(item.id) &&
                //   "bg-blue-200 dark:bg-blue-900"
                )}
                onClick={() => {
                  setThreadId(item.id);
                }}
              >
                {/* {threadId === item.id && (
                  <motion.div
                    className="absolute inset-0 dark:bg-white/20 bg-black/10 z-[-1] rounded-lg"
                    layoutId="thread-list-item"
                    transition={{
                      duration: 0.1,
                      ease: "easeInOut",
                    }}
                  />
                )} */}
                <div className="flex flex-col w-full gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {item.emails.at(-1)?.from?.name}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "ml-auto text-xs",
                        // threadId === item.id
                        //   ? "text-foreground"
                        //   : "text-muted-foreground"
                      )}
                    >
                      {/* {formatDistanceToNow(item.emails.at(-1)?.sentAt ?? new Date(), {
                        addSuffix: true,
                      })} */}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{item.subject}</div>
                </div>
                <div
                  className="text-xs line-clamp-2 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.emails.at(-1)?.bodySnippet ?? "", {
                      USE_PROFILES: { html: true },
                    }),
                  }}
                ></div>
                {item.emails[0]?.sysLabels.length ? (
                  <div className="flex items-center gap-2">
                    {item.emails.at(0)?.sysLabels.map((label) => (
                      <Badge
                        key={label}
                        variant={getBadgeVariantFromLabel(label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
                </React.Fragment>
            })}
        </div>

    </div>
  )
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}

export default ThreadList