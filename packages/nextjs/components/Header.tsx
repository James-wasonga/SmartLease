// "use client";

// import { Routes } from "@/app/routes";
// import { WalletWatcher } from "./WalletWatcher";
// import { RainbowKitCustomConnectButton } from "./scaffold-eth";
// import DashboardTabLayout from "./shared/dashboard-tab-layout";
// import { LANDLORDNAV, TENANTNAV } from "@/constants/dashboard-nav";
// import { useOutsideClick } from "@/hooks/scaffold-eth";
// import { cn } from "@/lib/utils";
// import { BugAntIcon, HomeIcon } from "@heroicons/react/24/outline";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React, { ReactNode, useCallback, useRef, useState } from "react";

// type HeaderMenuLink = {
//   label: string;
//   href: string;
//   icon?: React.ReactNode;
// };

// export const menuLinks: HeaderMenuLink[] = [
//   {
//     label: "Home",
//     href: "/",
//     icon: <HomeIcon className="h-4 w-4" />,
//   },
//   {
//     label: "Debug Contracts",
//     href: "/debug",
//     icon: <BugAntIcon className="h-4 w-4" />,
//   },
// ];

// export const HeaderMenuLinks = () => {
//   const pathname = usePathname();

//   return (
//     <>
//       {menuLinks.map(({ label, href, icon }) => {
//         const isActive = pathname === href;
//         return (
//           <li key={href}>
//             <Link
//               href={href}
//               passHref
//               className={cn(
//                 "relative flex text-slate-800 items-center justify-between px-4 py-2 text-sm transition-colors duration-200",
//                 isActive
//                   ? "rounded-full text-white bg-primary/80"
//                   : "text-slate-400"
//               )}
//             >
//               {icon}
//               {label}
//             </Link>
//           </li>
//         );
//       })}
//     </>
//   );
// };

// /**
//  * Site header
//  */
// export const Header = () => {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const burgerMenuRef = useRef<HTMLDivElement>(null);
//   useOutsideClick(
//     burgerMenuRef,
//     useCallback(() => setIsDrawerOpen(false), [])
//   );
//   const path = usePathname();

//   const GeneralHeader = () => {
//     return (
//       <>
//         {/* <div className=" flex items-center space-x-3 py-5">
//           <div className="lg:hidden dropdown" ref={burgerMenuRef}>
//             <label
//               tabIndex={0}
//               className={`ml-1 bg-secondary ${
//                 isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"
//               }`}
//               onClick={() => {
//                 setIsDrawerOpen((prevIsOpenState) => !prevIsOpenState);
//               }}
//             >
//               <Bars3Icon className="h-1/2" />
//             </label>
//             {isDrawerOpen && (
//               <ul
//                 tabIndex={0}
//                 className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
//                 onClick={() => {
//                   setIsDrawerOpen(false);
//                 }}
//               >
//                 <HeaderMenuLinks />
//               </ul>
//             )}
//           </div>

//           <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
//             <HeaderMenuLinks />
//           </ul>
//         </div> */}
//         <div className="text-xl font-bold text-blue-600 py-6">SmartLease</div>
//       </>
//     );
//   };

//   const getHeaderType = (): ReactNode => {
//     //@ts-ignore
//     if (path.startsWith("/tenant"))
//       return <DashboardTabLayout tabList={TENANTNAV} />;
//     //@ts-ignore
//     if (path.startsWith("/landlord"))
//       return <DashboardTabLayout tabList={LANDLORDNAV} />;
//     return <GeneralHeader />;
//   };

//   return (
//     <header className="sticky top-0  z-20 px-0 sm:px-2 border-b border-gray-300 bg-white">
//       <div className="flex items-end justify-between app-container">
//         {getHeaderType()}

//         {!path.startsWith("/landlord") && !path.startsWith("/tenant") && (
//           <nav className="space-x-6 py-6">
//             <Link href={Routes.HOME} className="text-gray-700 hover:text-blue-600">
//               Home
//             </Link>
//             <Link href={Routes.BROWSE_PROPERTIES} className="text-gray-700 hover:text-blue-600">
//               Browse
//             </Link>
//             <Link href={Routes.HOW_IT_WORKS} className="text-gray-700 hover:text-blue-600">
//               How It Works
//             </Link>
//             <Link href="#" className="text-gray-700 hover:text-blue-600">
//               Contact
//             </Link>
//           </nav>
//         )}

//         <div className="mr-4 flex items-center py-5 space-x-3">
//           <WalletWatcher />
//           <RainbowKitCustomConnectButton />
//         </div>
//       </div>
//     </header>
//   );
// };



"use client";

import { Routes } from "@/app/routes";
import { useOutsideClick } from "@/hooks/scaffold-eth";
import { cn } from "@/lib/utils";
import { BugAntIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useRef, useState } from "react";
import { WalletWatcher } from "./WalletWatcher";
import { RainbowKitCustomConnectButton } from "./scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={cn(
                "relative flex text-slate-800 items-center justify-between px-4 py-2 text-sm transition-colors duration-200",
                isActive
                  ? "rounded-full text-white bg-primary/80"
                  : "text-slate-400"
              )}
            >
              {icon}
              {label}
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), [])
  );
  const path = usePathname();

  const GeneralHeader = () => {
    return (
      <>
        <div className="py-4">
          <img
            src={'/logo-light_preview.png'}
            alt="SmartLease"
            className="h-12"
          />
        </div>
      </>
    );
  };


  return (
    <header className="sticky top-0  z-20 px-0 sm:px-2 border-b border-gray-300 bg-white">
      <div className="flex items-end justify-between app-container">
        <GeneralHeader />   

        {/* {!path.startsWith("/landlord") && !path.startsWith("/tenant") && ( */}
          <nav className="space-x-6 py-6">
            <Link href={Routes.HOME} className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link href={Routes.BROWSE_PROPERTIES} className="text-gray-700 hover:text-blue-600">
              Browse
            </Link>
            <Link href={Routes.HOW_IT_WORKS} className="text-gray-700 hover:text-blue-600">
              How It Works
            </Link>
            <Link href="#" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </nav>
        {/* )} */}

        <div className="mr-4 flex items-center py-5 space-x-3">
          <WalletWatcher />
          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
};