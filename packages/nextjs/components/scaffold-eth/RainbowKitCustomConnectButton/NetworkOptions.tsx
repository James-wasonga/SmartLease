import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getNetworkColor } from "@/hooks/scaffold-eth";
import { getTargetNetworks } from "@/utils/scaffold-eth";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import { useNetwork, useSwitchNetwork } from "wagmi";

const allowedNetworks = getTargetNetworks();

type NetworkOptionsProps = {
  hidden?: boolean;
};

export const NetworkOptions = ({ hidden = false }: NetworkOptionsProps) => {
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <>
      {allowedNetworks
        .filter((allowedNetwork) => allowedNetwork.id !== chain?.id)
        .map((allowedNetwork) => (
          <DropdownMenuItem
            key={allowedNetwork.id}
            className={hidden ? "hidden" : ""}
          >
            <Button
              className="menu-item bg-primary !rounded-xl flex gap-3 py-3 whitespace-nowrap"
              type="button"
              onClick={() => {
                switchNetwork?.(allowedNetwork.id);
              }}
            >
              <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0 text-slate-800" />
              <span className="text-slate-500">
                Switch to{" "}
                <span
                  style={{
                    color: getNetworkColor(allowedNetwork, isDarkMode),
                  }}
                >
                  {allowedNetwork.name}
                </span>
              </span>
            </Button>
          </DropdownMenuItem>
        ))}
    </>
  );
};
