import { cn } from "@/lib/utils"
import Image from "next/image"

const EmptyContent = ({className, emptyText}: {className: string, emptyText?: string}) => {
    return (
        <>
            <div className={cn("mt-6", className)}>
                <div className="flex flex-col gap-y-2 items-center w-full">
                    <Image
                        src={"/empty-state.svg"}
                        alt="empty state"
                        width={120}
                        height={50}
                        className="w-72"
                    />
                    <p className="-mt-14 text-sm text-[#667185]">{emptyText !== undefined ? emptyText: "Nothing to show at the moment"}</p>
                </div>
            </div>
        </>
    )
}

export default EmptyContent