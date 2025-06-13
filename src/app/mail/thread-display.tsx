import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useThread from "@/hooks/use-threads";
import { Archive, ArchiveX, Clock, MoreVertical, Trash2 } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import EmailDisplay from "./email-display";

const ThreadDisplay = () => {
  const { threadId, threads } = useThread();
  const thread = threads?.find((t) => t.id === threadId);
  return (
    <div className="flex h-full flex-col">
      {/* buttons row  */}
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Archive className="size-4 "></Archive>
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <ArchiveX className="size-4"></ArchiveX>
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Trash2 className="size-4 cursor-pointer"></Trash2>
          </Button>
        </div>
        <Separator orientation="vertical"></Separator>
        <Button
          className="ml-2"
          size={"icon"}
          disabled={!thread}
          variant={"ghost"}
        >
          <Clock className="size-4"></Clock>
        </Button>
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                className="ml-2"
                size={"icon"}
                disabled={!thread}
                variant={"ghost"}
              >
                <MoreVertical className="size-4"></MoreVertical>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator></Separator>
      {thread?<>
      <div className="flex flex-col flex-1 overflow-scroll custom-scrollbar">
        <div className="flex items-center p-4">
            <div className="flex items-center gap-4 text-sm">
                <Avatar>
                    <AvatarImage alt="img"></AvatarImage>
                    <AvatarFallback>
                        {thread.emails[0]?.from?.name?.split(' ').map(chunk=>chunk[0]).join('')}
                    </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                    <div className="font-semibold">
                        {thread.emails[0]?.from.name}
                        <div className="text-xs line-clamp-1">
                            {thread.emails[0]?.subject}
                        </div>
                        <div className="text-xs line-clamp-1">
                            <span className="font-medium mr-1">
                                Reply-To:
                            </span>
                            {thread.emails[0]?.from?.address}
                        </div>
                    </div>
                </div>

        </div>
        {thread.emails[0]?.sentAt&&(
            <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(thread.emails[0]?.sentAt),'PPpp')}
            </div>
        )}
        </div>

        <Separator></Separator>
        <div className="overflow-scroll custom-scrollbar max-h-[calc(100vh-200px)] flex flex-col">
            <div className="p-6 flex flex-col gap-4">
                {thread.emails.map(email=>{
                    return <EmailDisplay key={email.id} email={email}></EmailDisplay>
                })}
            </div>
        </div>
        <div className="flex-1"></div>
        <Separator className="mt-auto"></Separator>
        {/* reply box  */}
        <div className="">
            reply box
        </div>
      </div>
      </>:<>
      <div className="p-8 text-center text-muted-foreground">No mail selected</div>
      </>}
    </div>
  );
};

export default ThreadDisplay;
