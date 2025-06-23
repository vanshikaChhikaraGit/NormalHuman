import React from "react";
import EmailEditor from "./email-editor";
import { api, RouterOutputs } from "@/trpc/react";
import useThread from "@/hooks/use-threads";
import { toast } from "sonner";

const ReplyBox = () => {
  const { threadId, accountId } = useThread();
  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    threadId: threadId ?? "",
    accountId,
  });

  if (!replyDetails) return null;

  return <Component replyDetails={replyDetails}></Component>;
};

const Component = ({
  replyDetails,
}: {
  replyDetails: RouterOutputs["account"]["getReplyDetails"];
}) => {
  const { threadId, accountId } = useThread();
  const [subject, setSubject] = React.useState(
    replyDetails.subject.startsWith("Re:")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );
  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.to.map((to) => ({
      label: to.address ?? to.name,
      value: to.address,
    })) || [],
  );
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.cc.map((cc) => ({
      label: cc.address ?? cc.name,
      value: cc.address,
    })) || [],
  );

  React.useEffect(() => {
    if (!replyDetails || !threadId) return;
    if (!replyDetails.subject.startsWith("Re:")) {
      setSubject(`Re: ${replyDetails.subject}`);
    }
    setToValues(
      replyDetails.to.map((to) => ({
        label: to.address ?? to.name,
        value: to.address,
      })),
    );
    setCcValues(
      replyDetails.cc.map((cc) => ({
        label: cc.address ?? cc.name,
        value: cc.address,
      })),
    );
  }, [threadId, replyDetails]);

  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = (value: string) => {
    if (!replyDetails) return;

    sendEmail.mutate({
      accountId,
      threadId: threadId ?? undefined,
      body: value,
      subject,
      from: replyDetails.from,
      to: replyDetails.to.map((to) => ({
        address: to.address,
        name: to.name ?? "",
      })),
      cc: replyDetails.cc.map((cc) => ({
        address: cc.address,
        name: cc.name ?? "",
      })),
      replyTo: replyDetails.from,
      inReplyTo: replyDetails.id,
    },{
      onSuccess() {
          toast.success('Email sent 🎉')
      },
      onError() {
          toast.error('Error sending email')
      },
    });
  };
  return (
    <div className="">
      <EmailEditor
        toValues={toValues}
        setToValues={setToValues}
        ccValues={ccValues}
        setCcValues={setCcValues}
        subject={subject}
        setSubject={setSubject}
        to={replyDetails.to.map((to) => to.address)}
        handleSend={handleSend}
        isSending={sendEmail.isPending}
      ></EmailEditor>
    </div>
  );
};

export default ReplyBox;
