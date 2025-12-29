import { BrochureBillboardItem } from "@/types/billboard.types";

import Image from "next/image";
import TextIcon from "./components/text-icon";
import BrochureHeader from "./components/brochure-header";



type BrochureProps = {
    items: BrochureBillboardItem[]
}

export default function Brochure({ items }: BrochureProps) {
    return (
        <div id="brochure">
            {items.map(item =>
                <div key={item.id} className="flex justify-center space-y-4 h-full">
                    <div key={item.id} className="bg-white w-[210mm] h-[297mm] px-4 relative">
                        <div className="h-[866px] w-full flex flex-col items-end">
                            <div className="h-[586px] flex flex-col justify-end pb-4 w-full rounded-bl-2xl" style={{ backgroundColor: item.color }}>
                                <BrochureHeader item={item} />
                                <div className="px-4 flex justify-between ">
                                    <div className="w-[415px] h-[410px] rounded-2xl overflow-hidden relative">
                                        <span className="absolute top-4 left-4 text-2xl font-black size-10 shadow-neutral-600/30 shadow-md flex justify-center items-center rounded-md bg-white">A</span>
                                        <Image src={item.images[0] || "/empty.jpg"} quality={100} unoptimized width={415} height={410} alt="Image panneau 1" className="!object-cover !object-center !w-full !h-full" />
                                    </div>
                                    <div className="w-[300px] h-[290px]">
                                        <div className="w-[140px] overflow-hidden h-[50px] relative top-[1px] rounded-t-2xl bg-white flex items-center">
                                            <Image src="/map-clic.png" width={140} height={50} alt="Map clic" className="object-cover object-center" />
                                        </div>
                                        <div className="w-full h-[210px] rounded-r-2xl rounded-bl-2xl bg-white overflow-hidden">
                                            <Image
                                                // src={item.maps}
                                                src="/empty.jpg"
                                                width={410}
                                                height={210}
                                                alt="Localisation du panneau"
                                                className="object-cover !w-auto !h-auto object-center"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex h-[280px]">
                                <div className="w-[328px] h-[280px]">
                                    <Image src="/female.png" quality={100} unoptimized alt="Femme qui saute de joie" width={328} height={311} className="scale-[108%] relative -top-[29px]" />
                                </div>
                                <div className="h-[270px] w-[434px] rounded-b-2xl px-3 relative" style={{ backgroundColor: item.color }}>
                                    <div className="w-[410px] h-[410px] rounded-2xl absolute bottom-3 right-3 overflow-hidden">
                                        <span className="absolute top-4 left-4 text-2xl font-black size-10 shadow-neutral-600/30 shadow-md flex justify-center items-center rounded-md bg-white">B</span>
                                        <Image src={item.images[1] || "/empty.jpg"} quality={100} unoptimized width={410} height={410} alt="Image panneau 2" className="!object-cover !object-center !w-full !h-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[257px] w-full z-10 relative bg-white">
                            <div className="!border-2 !border-black rounded-2xl h-[190px] p-4 grid grid-cols-2 gap-x-4">
                                <div className="space-y-2">
                                    <TextIcon
                                        path="/billboard.png"
                                        title={item.type}
                                    />
                                    <TextIcon
                                        path="/route.png"
                                        title={item.orientation}
                                    />
                                    <TextIcon
                                        path="/pin.png"
                                        title={item.address}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <TextIcon
                                        path="/branding.png"
                                        title="Panneau au sol (face x2)"
                                    />
                                    <TextIcon
                                        path="/resize.png"
                                        title={`${item.width}m x ${item.height}m`}
                                    />
                                    <TextIcon
                                        path="/check.png"
                                        title="Panneau au sol (face x2)"
                                    />
                                </div>
                            </div>


                            <div className="w-[320px] h-[65px] flex items-center !border-2 border-black rounded-2xl relative -top-3.5" style={{ backgroundColor: item.color }}>
                                <TextIcon
                                    path="/hash-tag.png"
                                    title={item.reference}
                                    className="text-white text-lg gap-x-6 pl-8 h-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
