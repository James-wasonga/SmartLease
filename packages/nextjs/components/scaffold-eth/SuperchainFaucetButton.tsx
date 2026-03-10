"use client";

import opLogo from "../assets/optimism_logo.png";
import Image from "next/image";

/**
 * FaucetButton button which lets you grab eth.
 */
export const SuperchainFaucetButton = () => {
  const openSuperchainFaucet = () => {
    window.open(
      "https://app.optimism.io/faucet?utm_source=scaffoldop",
      "_blank"
    );
  };

  return (
    <div className={"ml-1"} data-tip="Grab funds from Superchain faucet">
      <button
        className="btn bg-base-100 btn-md rounded-full flex-nowrap"
        onClick={() => openSuperchainFaucet()}
      >
        <Image alt="Optimism Logo" src={opLogo.src} width={20} height={20} />
        Superchain Faucet
      </button>
    </div>
  );
};
