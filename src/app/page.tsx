import { Button } from "@/components/ui/button";
import LinkAccountButton from "@/components/ui/link-account-button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {

  return (
    <h1 className="text-red-500">
      
<LinkAccountButton></LinkAccountButton>
<UserButton></UserButton>
</h1>
  );
}
