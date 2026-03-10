import { Home, HelpCircle, Shield, Settings } from "lucide-react";
import { Button } from "~~/components/ui/button";

const TenantLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}

      {/* <footer
        className="flex-jb-ic px-[13rem] py-5 border-t mt-20 relative bottom-1
      "
      >
        <div className="space-y-2">
          <p className="text-dark flex-ic gap-2">
            <Home className="notfi-icon !rounded-sm bg-emerald-400 text-white" />
            Smart Lease
          </p>
          <p className="text-gray">Building ownership, one payment at a time</p>
        </div>
        <div className="flex-ic gap-4 text-gray">
          <p className=" flex-ic gap-2">Terms of Service</p>
          <p className=" flex-ic gap-2">
            <Settings className="w-4" />
            Settings
          </p>
          <p className=" flex-ic gap-2">
            <Shield className="w-4" />
            Privacy
          </p>
        </div>
        <Button className="absolute right-1 shadow-md rounded-tr-none rounded-l-3xl rounded-br-2xl  py-1">
          <HelpCircle /> Help
        </Button>
      </footer> */}
    </>
  );
};

export default TenantLayout;
