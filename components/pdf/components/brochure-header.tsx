import { cutText } from "@/lib/utils"
import { BrochureBillboardItem } from "@/types/billboard.types"
import Image from "next/image"

type BrochureHeaderProps = {
    item: BrochureBillboardItem
}

export default function BrochureHeader({ item }: BrochureHeaderProps) {
    return (
        <div className="flex justify-between p-4">
            <div className="text-white -space-y-1.5">
                <h1 className="!text-[48px] !font-black uppercase relative top-6">{cutText(item.name, 17, false)} </h1>
                <p className="text-2xl font-black relative top-4">{Number(item.width) * Number(item.height)} m2</p>
            </div>
            <div className="h-full">
                <Image src="/b-logo.png" width={140} height={140} alt="Atlas logo" className="size-[140px] object-center object-bottom" />
            </div>
        </div>

    )
}
