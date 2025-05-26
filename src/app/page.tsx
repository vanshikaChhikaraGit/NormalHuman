import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {

  return (
    <h1 className="text-red-500">
<Button>hi</Button>
      <UserButton>hi</UserButton>
      </h1>
  );
}
