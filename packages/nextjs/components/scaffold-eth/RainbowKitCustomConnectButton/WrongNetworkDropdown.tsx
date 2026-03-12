import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1 mr-2">
          <span>Wrong network</span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="gap-1">
        <NetworkOptions />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-error focus:text-error focus:bg-error/10"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-4 mr-2" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
