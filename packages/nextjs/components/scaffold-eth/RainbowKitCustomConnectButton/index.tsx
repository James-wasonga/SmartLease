"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { Button } from "@/components/ui/button";
import { useAutoConnect, useNetworkColor } from "@/hooks/scaffold-eth";
import { useTargetNetwork } from "@/hooks/scaffold-eth/useTargetNetwork";
import { getUserRole } from "@/lib/cookies";
import { getBlockExplorerAddressLink } from "@/utils/scaffold-eth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  
  useAutoConnect();
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    className="bg-primary text-base px-4 py-6 rounded-lg"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex items-center space-x-4">
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                    chainImgUrl={chain.iconUrl as string}
                    chainName={chain.name as string}
                    networkColor={networkColor}
                  />
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
