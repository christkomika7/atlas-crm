"use client";

import Image from "next/image";

type BilloardRentContractProps = {
  name: string;
  height: string;
  width: string;
  address: string;
  orientation: string;
  dimension: string;
  images: string[];
  maps: string;
  reference: string;

}

export default function BilloardRentContractPage() {

  return (
    <div className="flex justify-center space-y-4 pt-10 h-full">
      <div className="bg-white w-[794px] h-[1123px] px-4 relative">
        <div className="h-[866px] w-full flex flex-col items-end">
          <div className="h-[586px] flex flex-col justify-end pb-4 bg-red-600 w-full rounded-bl-2xl">
            <div className="flex justify-between items-end p-4">
              <div className="space-y-1 text-white">
                <h1 className="text-5xl font-black uppercase">Garnison</h1>
                <p className="text-2xl font-black">12 m2</p>
              </div>
              <div className="w-[100px] h-[100px]">
                <Image src="/b-logo.png" width={100} height={100} alt="Atlas logo" />
              </div>
            </div>
            <div className="px-4 flex justify-between ">
              <div className="w-[415px] h-[410px] rounded-2xl overflow-hidden relative">
                <span className="absolute top-4 left-4 text-2xl font-black size-10 shadow-neutral-600/30 shadow-md flex justify-center items-center  rounded-md bg-white">A</span>
                <Image src="/Brochure AC 4m x 3m PNR-1-007.png" width={415} height={410} alt="Image panneau 1" className="object-cover object-center" />
              </div>
              <div className="w-[300px] h-[290px]">
                <div className="w-[140px] overflow-hidden h-[50px] relative top-[1px] rounded-t-2xl bg-white flex items-center">
                  <Image src="/map-clic.png" width={140} height={50} alt="Map clic" className="object-cover object-center" />
                </div>
                <div className="w-full h-[210px] rounded-r-2xl rounded-bl-2xl bg-white overflow-hidden">
                  <Image src="/map.png" width={410} height={210} alt="Atlas logo" className="object-cover w-full object-center" />
                </div>
              </div>
            </div>

          </div>
          <div className="flex h-[280px]">
            <div className="w-[328px] h-[280px]">
              <Image src="/female.png" alt="Femme qui saute de joie" width={328} height={311} className="scale-[108%] relative -top-[29px]" />
            </div>
            <div className="h-[270px] bg-red-600 w-[434px] rounded-b-2xl px-3 relative">
              <div className="w-[410px] h-[410px] rounded-2xl absolute bottom-3 right-3 overflow-hidden">
                <span className="absolute top-4 left-4 text-2xl font-black size-10 shadow-neutral-600/30 shadow-md flex justify-center items-center  rounded-md bg-white">B</span>
                <Image src="/Brochure AC 4m x 3m PNR-1-005.png" width={410} height={410} alt="Image panneau 2" className="object-cover object-center" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-[257px] w-full z-10 relative bg-white">
          <div className="border-2 border-black rounded-2xl h-[200px] p-4 grid grid-cols-2 gap-x-4">
            <div className="space-y-2">
              <div className="grid grid-cols-[40px_1fr] gap-x-2 items-center">
                <div className="size-10">
                  <Image src="/billboard.png" width={40} height={40} alt="Billboard icon" className="object-cover w-full object-center" />
                </div>
                <p className="font-medium">Panneau au sol (face x2)</p>
              </div>
              <div className="grid grid-cols-[40px_1fr] gap-x-2 items-center">
                <div className="size-10">
                  <Image src="/route.png" width={40} height={40} alt="Route icon" className="object-cover w-full object-center" />
                </div>
                <p className="font-medium">Gendarmerie -&gt; Rp Davoum -&gt; Rp Davoun -&gt; Rond-point Ex-Bata </p>
              </div>
              <div className="grid grid-cols-[40px_1fr] gap-x-2 items-center">
                <div className="size-10">
                  <Image src="/pin.png" width={40} height={40} alt="Pin map icon" className="object-cover w-full object-center" />
                </div>
                <p className="font-medium">Panneau au sol (face x2)</p>
              </div>

            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[40px_1fr] gap-x-2 items-center">
                <div className="size-10">
                  <Image src="/branding.png" width={40} height={40} alt="Branding icon" className="object-cover w-full object-center" />
                </div>
                <p className="font-medium">Panneau au sol (face x2)</p>
              </div>
              <div className="grid grid-cols-[40px_1fr] gap-x-2 items-center">
                <div className="size-10">
                  <Image src="/resize.png" width={40} height={40} alt="Resize icon" className="object-cover w-full object-center" />
                </div>
                <p className="font-medium">Gendarmerie -&gt; Rp Davoum -&gt; Rp Davoun -&gt; Rond-point Ex-Bata </p>
              </div>
              <div className="grid grid-cols-[40px_1fr] gap-x-2 items-center">
                <div className="size-10">
                  <Image src="/check.png" width={40} height={40} alt="Check icon" className="object-cover w-full object-center" />
                </div>
                <p className="font-medium">Panneau au sol (face x2)</p>
              </div>
            </div>
          </div>
          <div className="border-2 border-black items-center rounded-2xl h-[70px] px-8 gap-x-10 w-[300px] relative -top-3.5 bg-red-600 grid grid-cols-[40px_1fr]">
            <div className="size-10">
              <Image src="/hash-tag.png" width={40} height={40} alt="Hashtag icon" className="object-cover w-full object-center" />
            </div>
            <p className="text-white font-medium text-lg">Q-1005-PNR</p>
          </div>
        </div>

      </div>
    </div>

  );
}
