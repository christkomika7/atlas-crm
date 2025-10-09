import { cn, resolveImageSrc } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

type DocumentPreviewProps = {
  firstColor: string;
  secondColor: string;
  logo?: File;
  logoSize?: string;
  logoPosition?: string;
};

export default function DocumentPreview({
  firstColor,
  secondColor,
  logo,
  logoSize,
  logoPosition,
}: DocumentPreviewProps) {
  const [logoURL, setLogoURL] = useState<string | null>(null);

  useEffect(() => {
    if (logo && logo instanceof File) {
      setLogoURL(resolveImageSrc(logo) as string);
    } else {
      setLogoURL(null);
    }
  }, [logo]);

  return (
    <div>
      <div
        className="flex w-full h-[200px]"
        style={{
          justifyContent:
            logoPosition === "Left"
              ? "flex-start"
              : logoPosition === "Right"
                ? "flex-end"
                : "center",
          alignItems: "center",
        }}
      >
        <div
          className={cn(
            "relative flex justify-center items-center object-center object-contain",
            logoSize === "Small" && "h-[80px]",
            logoSize === "Medium" && "h-[120px]",
            logoSize === "Large" && "h-[160px]"
          )}
        >
          {logoURL ? (
            <Image
              src={logoURL}
              alt="Logo"
              width={160}
              height={160}
              className="w-full h-full object-contain"
            />
          ) : (
            <h2 className="font-bold text-4xl">LOGO</h2>
          )}
        </div>
      </div>
      <div
        className="w-full h-2"
        style={{
          backgroundColor: firstColor,
        }}
      ></div>
      <div
        className="relative flex justify-between gap-x-2 mb-9 p-6"
        style={{
          backgroundColor: secondColor,
        }}
      >
        <span
          className="-bottom-3 left-1/2 absolute w-6 h-6 rotate-45 -translate-x-1/2"
          style={{
            backgroundColor: secondColor,
          }}
        />

        <div className="-space-y-0.5">
          <p className="gap-x-2 grid grid-cols-[60px_1fr] text-neutral-600 text-sm">
            <span className="font-semibold">BC N° :</span>
            <span className="font-medium">FAKE-1234</span>
          </p>
          <p className="gap-x-2 grid grid-cols-[60px_1fr] text-neutral-600 text-sm">
            <span className="font-semibold">Date :</span>
            <span className="font-medium">01/01/2025</span>
          </p>
          <p className="gap-x-2 grid grid-cols-[60px_1fr] text-neutral-600 text-sm">
            <span className="font-semibold">À :</span>
            <span className="font-medium">
              Entreprise Exemple SARL <br />
              exemple@email.com <br />
              42 Rue Fictive, Ville Imaginée
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-neutral-700 text-xl text-right">
            Bon de commande
          </h2>
          <div className="-space-y-0.5">
            <p className="text-neutral-600 text-sm text-right">
              123 Avenue du Test
            </p>
            <p className="text-neutral-600 text-sm text-right">BP: 0000</p>
            <p className="text-neutral-600 text-sm text-right">
              Ville Démo, Pays Démo
            </p>
            <p className="text-neutral-600 text-sm text-right">
              contact@entreprise.com
            </p>
            <p className="text-neutral-600 text-sm text-right">
              www.entreprise.com
            </p>
            <p className="text-neutral-600 text-sm text-right">+0000000000</p>
            <p className="text-neutral-600 text-sm text-right">
              RCCM: DEMO-0000-0000
            </p>
            <p className="text-neutral-600 text-sm text-right">
              NIF: 000000000000
            </p>
          </div>
        </div>
      </div>

      <table className="w-full">
        <thead className="h-10">
          <tr className="border-y w-full">
            <td className="px-3 font-semibold text-sm">Titre 1</td>
            <td className="px-3 w-[70px] font-semibold text-sm text-right">
              Col 2
            </td>
            <td className="px-3 w-[140px] font-semibold text-sm text-right">
              Col 3
            </td>
            <td className="px-3 w-[140px] font-semibold text-sm text-right">
              Col 4
            </td>
          </tr>
        </thead>
        <tbody>
          <tr className="text-sm">
            <td className="px-3 py-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque euismod, nisi eu consectetur.
            </td>
            <td className="py-2 text-right">42</td>
            <td className="py-2 text-right">123 456 XYZ</td>
            <td className="py-2 pr-3 text-right">789 000 XYZ</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="text-sm">
            <td colSpan={3} className="pr-10 text-right">
              Faux total
            </td>
            <td className="pr-3 text-right">789 000 XYZ</td>
          </tr>
          <tr className="text-sm">
            <td colSpan={3} className="pr-10 text-right">
              TVA 99%
            </td>
            <td className="pr-3 text-right">0 XYZ</td>
          </tr>
          <tr className="text-sm">
            <td colSpan={3} className="pr-10 text-right">
              CSS 99%
            </td>
            <td className="pr-3 text-right">789 000 XYZ</td>
          </tr>
          <tr className="text-sm">
            <td colSpan={3} className="pr-10 pb-2 text-right">
              Total final
            </td>
            <td className="pr-3 pb-2 text-right">789 000 XYZ</td>
          </tr>
          <tr className="text-sm">
            <td></td>
            <td></td>
            <td
              style={{
                backgroundColor: secondColor,
              }}
              className="py-3 pr-10 font-semibold text-right"
            >
              Total général
            </td>
            <td
              style={{
                backgroundColor: secondColor,
              }}
              className="pr-3 font-semibold text-right"
            >
              789 000 XYZ
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="p-3">
        <h3 className="mb-1 font-semibold text-sm">Message / remarques</h3>
        <p className="mb-2 text-sm">Campagne : Entreprise Démo</p>

        <p className="text-sm">
          <span className="font-medium">NB :</span> Merci de vérifier que toutes
          les informations sont correctes avant validation. Toute modification
          ultérieure pourrait entraîner un retard de traitement.
        </p>
      </div>
    </div>
  );
}
