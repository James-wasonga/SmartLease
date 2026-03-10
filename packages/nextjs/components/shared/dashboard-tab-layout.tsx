import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

export type TabType = {
  name: string;
  link: string;
  Icon?: ComponentType<{ className?: string }>;
};

const DashboardTabLayout = ({ tabList }: { tabList: TabType[] }) => {
  return (
    <>
      <Tabs defaultValue={tabList[0].name} className="max-w-sm w-full">
        <TabsList className="w-full p-0 bg-background justify-start  rounded-none">
          {tabList.map((tab) => (
            <TabsTrigger
              key={tab.name}
              value={tab.name}
              className="rounded-none bg-background h-full pb-6 data-[state=active]:shadow-none text-xl border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <div className="font-circular">
                <TabItem link={tab.link} name={tab.name} Icon={tab.Icon} />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
};

export default DashboardTabLayout;

const TabItem = ({ link, name, Icon }: TabType) => {
  const path = usePathname();

  // ❌ Duplicate definition of TabItem – commenting out this block
  // const TabItem = ({ link, name, Icon }: TabType) => {
  //   const path = usePathname();

  //   return (
  //     <>
  //       <Link href={link} className="">
  //         <div
  //           className={cn(
  //             "font-medium flex items-center space-x-3 text-slate-700",
  //             { "text-primary": path === link }
  //           )}
  //         >
  //           {Icon && <Icon className="" />}
  //           <p className="font-medium text-lg font-circular">{name}</p>
  //         </div>
  //       </Link>
  //     </>
  //   );
  // };

  return (
    <Link href={link} className="">
      <div
        className={cn(
          "font-medium flex items-center space-x-3 text-slate-700",
          { "text-primary": path === link }
        )}
      >
        {Icon && <Icon className="" />}
        <p className="font-medium text-lg font-circular">{name}</p>
      </div>
    </Link>
  );
};
