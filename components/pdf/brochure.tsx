"use client";

import { cutText, resolveImageSrc, urlToFile } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

type BillboardItem = {
    id: string;
    type: string;
    name: string;
    height: string;
    color: string;
    width: string;
    address: string;
    orientation: string;
    dimension: string;
    images: string[];
    maps: string;
    reference: string;
}

type BrochureProps = {
    items: BillboardItem[]
}

type BillboardWithImages = BillboardItem & {
    firstImage: string;
    secondImage: string;
}

export default function Brochure({ items }: BrochureProps) {
    const [images, setImages] = useState<BillboardWithImages[]>([]);

    useEffect(() => {
        async function getProfil() {
            const updatedItems: BillboardWithImages[] = await Promise.all(
                items.map(async (item) => {
                    let first = "";
                    let second = "";

                    if (item.images && item.images.length > 0) {
                        first = resolveImageSrc(await urlToFile(item.images[0])) || "";
                        second = String(item.images[1] ? resolveImageSrc(await urlToFile(item.images[1])) : "");
                    }

                    return {
                        ...item,
                        firstImage: first,
                        secondImage: second,
                    };
                })
            );
            setImages(updatedItems);
        }

        getProfil();
    }, [items])

    function getStaticMapImage(mapValue: string) {
        const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

        if (!mapValue || !API_KEY) return "/empty.jpg";

        const encoded = encodeURIComponent(mapValue);

        return `https://maps.googleapis.com/maps/api/staticmap?center=${encoded}&zoom=16&size=600x300&scale=2&maptype=roadmap&markers=color:red|${encoded}&key=${API_KEY}`;
    }

    return (
        <div id="brochure">
            {images.map(item =>
                <div key={item.id} className="flex justify-center space-y-4 h-full">
                    <div key={item.id} className="bg-white w-[210mm] h-[297mm] px-4 relative">
                        <div className="h-[866px] w-full flex flex-col items-end">
                            <div className="h-[586px] flex flex-col justify-end pb-4 w-full rounded-bl-2xl" style={{ backgroundColor: item.color }}>
                                <div className="flex justify-between items-end p-4">
                                    <div className="-space-y-1 text-white">
                                        <h1 className="!text-[52px] !font-black uppercase">{cutText(item.name, 17, false)} </h1>
                                        <p className="text-2xl font-black">{Number(item.width) * Number(item.height)} m2</p>
                                    </div>
                                    <div className="w-[120px] h-[120px]">
                                        <Image src="/b-logo.png" width={120} height={120} alt="Atlas logo" />
                                    </div>
                                </div>
                                <div className="px-4 flex justify-between ">
                                    <div className="w-[415px] h-[410px] rounded-2xl overflow-hidden relative">
                                        <span className="absolute top-4 left-4 text-2xl font-black size-10 shadow-neutral-600/30 shadow-md flex justify-center items-center rounded-md bg-white">A</span>
                                        <Image src={item.firstImage || "/empty.jpg"} width={415} height={410} alt="Image panneau 1" className="!object-cover !object-center !w-full !h-full" />
                                    </div>
                                    <div className="w-[300px] h-[290px]">
                                        <div className="w-[140px] overflow-hidden h-[50px] relative top-[1px] rounded-t-2xl bg-white flex items-center">
                                            <Image src="/map-clic.png" width={140} height={50} alt="Map clic" className="object-cover object-center" />
                                        </div>
                                        <div className="w-full h-[210px] rounded-r-2xl rounded-bl-2xl bg-white overflow-hidden">
                                            <Image
                                                src={getStaticMapImage(item.maps)}
                                                width={410}
                                                height={210}
                                                alt="Localisation du panneau"
                                                className="object-cover !w-full !h-full object-center"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex h-[280px]">
                                <div className="w-[328px] h-[280px]">
                                    <Image src="/female.png" alt="Femme qui saute de joie" width={328} height={311} className="scale-[108%] relative -top-[29px]" />
                                </div>
                                <div className="h-[270px] w-[434px] rounded-b-2xl px-3 relative" style={{ backgroundColor: item.color }}>
                                    <div className="w-[410px] h-[410px] rounded-2xl absolute bottom-3 right-3 overflow-hidden">
                                        <span className="absolute top-4 left-4 text-2xl font-black size-10 shadow-neutral-600/30 shadow-md flex justify-center items-center rounded-md bg-white">B</span>
                                        <Image src={item.secondImage || "/empty.jpg"} width={410} height={410} alt="Image panneau 2" className="!object-cover !object-center !w-full !h-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[257px] w-full z-10 relative bg-white">
                            <div className="!border-2 !border-black rounded-2xl h-[190px] p-4 grid grid-cols-2 gap-x-4">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[35px_1fr] !gap-x-2 items-center">
                                        <div className="size-[35px]">
                                            <Image src="/billboard.png" width={35} height={35} alt="Billboard icon" className="object-cover w-full object-center" />
                                        </div>
                                        <p className="font-medium">{item.type}</p>
                                    </div>
                                    <div className="grid grid-cols-[35px_1fr] gap-x-2 items-center">
                                        <div className="size-[35px]">
                                            <Image src="/route.png" width={35} height={35} alt="Route icon" className="object-cover w-full object-center" />
                                        </div>
                                        <p className="font-medium">{item.orientation}</p>
                                    </div>
                                    <div className="grid grid-cols-[35px_1fr] gap-x-2 items-center">
                                        <div className="size-[35px]">
                                            <Image src="/pin.png" width={35} height={35} alt="Pin map icon" className="object-cover w-full object-center" />
                                        </div>
                                        <p className="font-medium">{item.address}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[35px_1fr] gap-x-2 items-center">
                                        <div className="size-[35px]">
                                            <Image src="/branding.png" width={35} height={35} alt="Branding icon" className="object-cover w-full object-center" />
                                        </div>
                                        <p className="font-medium">Panneau au sol (face x2)</p>
                                    </div>
                                    <div className="grid grid-cols-[35px_1fr] gap-x-2 items-center">
                                        <div className="size-[35px]">
                                            <Image src="/resize.png" width={35} height={35} alt="Resize icon" className="object-cover w-full object-center" />
                                        </div>
                                        <p className="font-medium">{item.width}m x {item.height}m</p>
                                    </div>
                                    <div className="grid grid-cols-[35px_1fr] gap-x-2 items-center">
                                        <div className="size-[35px]">
                                            <Image src="/check.png" width={35} height={35} alt="Check icon" className="object-cover w-full object-center" />
                                        </div>
                                        <p className="font-medium">Panneau au sol (face x2)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="!border-2 !border-black !items-center rounded-2xl h-[65px] px-8 gap-x-9 w-[320px] relative -top-3.5 !flex" style={{ backgroundColor: item.color }}>
                                <div className="size-[35px]">
                                    <Image src="/hash-tag.png" width={35} height={35} alt="Hashtag icon" className="!object-contain !object-center !w-full !h-full" />
                                </div>
                                <div className="!flex !items-center">
                                    <p className="text-white font-medium text-lg">{item.reference}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
