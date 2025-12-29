import { cn } from "@/lib/utils";
import Image from "next/image"

type TextIconProps = {
    title: string;
    path: string;
    className?: string

}

export default function TextIcon({ title, path, className }: TextIconProps) {
    return (
        <div className={cn("grid grid-cols-[40px_1fr] items-center gap-x-2", className)}>
            <div className="relative size-[40px]">
                <Image src={path} fill alt="Image icon" className="object-contain w-full h-full object-center" />
            </div>
            <p className="font-medium h-full flex items-center relative top-2">{title}</p>
        </div>
    )
}
