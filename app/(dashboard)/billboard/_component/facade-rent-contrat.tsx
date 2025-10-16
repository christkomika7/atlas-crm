import { ScrollArea } from "@/components/ui/scroll-area";

export default function FacadeRentContrat() {
  return (
    <ScrollArea className="w-full h-[4000px] [&>[data-radix-scroll-area-viewport]]:max-h-[calc(100vh-32px)] text-sm">
      <div id="capture">
        {/* Page 1 */}
        <div className="flex flex-col justify-between bg-amber-50 mb-4 p-8 w-[794px] h-[1123px]">
          <div className="space-y-3">
            <h2 className="p-4 border-6 border-black font-semibold text-2xl text-center">
              <span className="inline-block text-center">
                CONTRAT DE LOCATION DE FACADE SUR <br /> BATIMENT OU TERRAIN
                PRIVÉE <br />
                CONGO
              </span>
            </h2>
            <h3 className="font-semibold text-xl">D'une part,</h3>
            <div className="space-y-0.5">
              <p className="">
                <span className="font-semibold">Nom : </span>{" "}
                <span>Total Energie (TE)</span>
              </p>
              <p className="">
                <span className="font-semibold">Type : </span>
                <span>TSA</span>
              </p>
              <p className="">
                <span className="font-semibold">Capital : </span>
                <span>5.000.000 Francs CFA</span>
              </p>
              <p className="">
                <span className="font-semibold">
                  Registre du Commerce et du Crédit Mobilier (RCCM) :
                </span>
                <span>12345678902</span>
              </p>
              <p className="">
                <span className="font-semibold">Numéro scal : </span>
                <span>09876543212</span>
              </p>
              <p className="">
                <span className="font-semibold">Siège social : </span>
                <span>39 rue de la place, à Libreville, Gabon.</span>
              </p>
              <p className="">
                Représentée par <span>Paul Dupin</span>, agissant en qualité de{" "}
                <span>Directeur Général</span>, dûment habilité à cet effet,
                ci-après dénommée le « L’Annonceur ».
              </p>
            </div>
            <h3 className="font-semibold text-xl">Et d'autre part,</h3>
            <div className="space-y-0.5">
              <p className="flex gap-x-1">
                <span className="font-semibold">Nom : </span>{" "}
                <span>ATLAS Congo</span>
              </p>
              <p className="">
                <span className="font-semibold">Type : </span>
                <span>Société à Responsabilité Limitée (SARL)</span>
              </p>
              <p className="">
                <span className="font-semibold">Capital : </span>
                <span>5 000 000 de Francs CFA</span>
              </p>
              <p className="">
                <span className="font-semibold">Siège social : </span>
                <span>
                  111, Avenue Moé VANGOULA Centre-Ville, BP: 746 Pointe-Noire,
                  République du Congo
                </span>
              </p>
              <p className="">
                <span className="font-semibold">RCCM : </span>
                <span>CG/PNR 14B356</span>
              </p>
              <p className="">
                <span className="font-semibold">NIU : </span>
                <span>M2014110001207071</span>
              </p>
              <p className="">
                Représentée aux ns des présentes par M. Ralph PINTO agissant en
                qualité de Co-Gérant. Ci-dessous dénommée « La Régie
                Publicitaire » D’autre part.
              </p>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-semibold text-xl">
                Il a été convenu et arrêté ce qui suit :
              </h3>
              <div className="space-y-2">
                <p className="[text-indent:2em]">
                  Les parties déclarent et garantissent posséder la capacité
                  juridique nécessaire pour contracter et s'engager au titre du
                  présent contrat. Elles reconnaissent que le contrat a été
                  négocié de manière équitable et que chacune a eu la
                  possibilité de consulter un conseiller juridique.
                </p>
                <p className="[text-indent:2em]">
                  Le présent contrat est régi par les lois en vigueur de la
                  République Congolaise et est sujet à modi cation uniquement
                  par accord écrit et signé par les deux parties.
                </p>
                <p className="[text-indent:2em]">
                  Ce contrat prend effet à la date de sa signature par les deux
                  parties et demeurera en vigueur jusqu'à l'achèvement de toutes
                  les obligations contractuelles, sauf résiliation anticipée
                  conforme aux dispositions établies dans les articles suivants.
                </p>
              </div>
            </div>
          </div>
          <div className="items-center grid grid-cols-3">
            <p></p>
            <p className="font-semibold text-center">Contrat AC-FAC-003</p>
            <p className="text-sm text-end">1 sur 9</p>
          </div>
        </div>
        {/* Page 2 */}
        <div className="flex flex-col justify-between bg-amber-50 p-8 w-[794px] h-[1123px]">
          <div className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="font-semibold text-xl underline">
                Article 1 : Objet du Contrat
              </h2>
              <div className="space-y-2">
                <p className="[text-indent:2em]">
                  Le présent contrat a pour objet la location par le Bailleur à
                  La Régie Publicitaire de la façade de l'immeuble situé au
                  rond-point Kassai, Pointe-Noire, Congo, exclusivement pour
                  l'installation et l'exploitation d'un panneau publicitaire.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Description de l'Emplacement :
                  </span>{" "}
                  La façade de l'immeuble est décrite comme suit (détailler
                  l'emplacement, dimensions, visibilité).
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Installation du Panneau :
                  </span>{" "}
                  Le panneau publicitaire sera un cadre en acier galvanisé dit
                  bi-tubulaire constitué d’échelles et de pates de xations,
                  installé et maintenu aux frais et sous la responsabilité de La
                  Régie Publicitaire. Ce dispositif est et restera la propriété
                  de La Régie Publicitaire.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">Usage du Panneau :</span> Le
                  panneau sera utilisé exclusivement pour l'af chage de
                  publicités des clients de la régie publicitaire. Le Bailleur
                  ne sera pas impliqué dans le choix ou l'approbation des
                  publicités af chées.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Conformité et Approbations :
                  </span>{" "}
                  La Régie Publicitaire s'engage à obtenir toutes les
                  approbations nécessaires des autorités compétentes pour
                  l'installation et l'exploitation du panneau publicitaire. La
                  Régie Publicitaire garantit que l'installation sera conforme
                  aux normes et règlements locaux, y compris les normes de
                  sécurité et environnementales.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">Accès à l'Emplacement :</span>{" "}
                  Le Bailleur fournira à La Régie Publicitaire un accès
                  raisonnable à l'emplacement pour l'installation, l'entretien,
                  et, le cas échéant, le démontage du panneau.
                </p>
              </div>
            </div>
            <div className="space-y-0.5">
              <h2 className="font-semibold text-xl underline">
                Article 2 : Durée de la Location
              </h2>
              <div className="space-y-2">
                <p className="[text-indent:2em]">
                  La location est consentie pour une durée déterminée, avec des
                  dispositions spéci ques pour le renouvellement et la
                  résiliation :
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">Durée Initiale :</span> La
                  durée initiale du contrat est d’un (1) an, commençant le
                  01/01/2025 et se terminant le 31/12/2025. Cette période est
                  invariable, sauf accord écrit contraire des deux parties.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Renouvellement Automatique :
                  </span>{" "}
                  À l'expiration de la durée initiale, ce contrat sera
                  automatiquement renouvelé pour des périodes successives d'un
                  an, sauf si l'une des parties noti e à l'autre son intention
                  de ne pas renouveler le contrat. Cette noti cation doit être
                  faite par écrit au moins trois mois avant la n de la période
                  en cours.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Modification de la Durée :
                  </span>{" "}
                  Le oute modi cation de la durée de la location après la
                  période initiale doit être convenue par écrit par les deux
                  parties. Cette modi cation peut inclure une extension ou une
                  réduction de la durée de location, selon les besoins des
                  parties.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Conditions de Résiliation Anticipée :
                  </span>{" "}
                  Chaque partie a le droit de résilier ce contrat avant la n de
                  la période de location en cours, sous réserve des conditions
                  dé nies à l'Article 12 du présent contrat.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Conséquences de la Fin de la Location :
                  </span>{" "}
                  À l'expiration ou à la résiliation du contrat, La Régie
                  Publicitaire s'engage à retirer le panneau publicitaire et à
                  remettre la façade dans son état initial, conformément aux
                  termes de l'Article 12.
                </p>
              </div>
            </div>
          </div>
          <div className="items-center grid grid-cols-3">
            <p></p>
            <p className="font-semibold text-center">Contrat AC-FAC-003</p>
            <p className="text-sm text-end">2 sur 9</p>
          </div>
        </div>
        {/* Page 3 */}
        <div className="flex flex-col justify-between bg-amber-50 p-8 w-[794px] h-[1123px]">
          <div className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="font-semibold text-xl underline">
                Article 3 : Obligations du Bailleur
              </h2>
              <div className="space-y-2">
                <p className="[text-indent:2em]">
                  Dans le cadre de ce contrat de location pour l'installation
                  d'un dispositif publicitaire, le Bailleur s'engage à respecter
                  les obligations suivantes :
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Mise à Disposition de l’Emplacement :
                  </span>{" "}
                  Le Bailleur mettra à disposition de La Régie Publicitaire
                  l’emplacement désigné pour l’installation du dispositif
                  publicitaire, libre de tout droit d’un tiers. L'emplacement
                  sera dégagé et prêt pour l'installation à la date convenue.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Accès pour Installation et Entretien :
                  </span>{" "}
                  Le Bailleur s'engage à donner au personnel de La Régie
                  Publicitaire et de son ou ses sous-traitant(s) un libre-accès
                  aux emplacements nécessaires pour la réalisation des travaux
                  de mise en place, d’entretien et de modi cation du dispositif
                  publicitaire.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Gestion de la Végétation :
                  </span>{" "}
                  Le La Régie Publicitaire sera autorisée à procéder à la
                  suppression ou à l’élagage de la végétation pouvant masquer
                  les messages publicitaires, en respectant les contraintes
                  environnementales en vigueur. Toute action de ce type
                  nécessite un accord express et préalable du Bailleur.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Accès au Réseau Électrique :
                  </span>{" "}
                  Lorsqu’il y a lieu, le Bailleur accordera à la Régie
                  Publicitaire l’accès au réseau électrique pour permettre
                  l’installation de l’éclairage du dispositif publicitaire. Les
                  frais de consommation électrique générés par le dispositif
                  seront entièrement à la charge de la Régie Publicitaire et ne
                  pourront en aucun cas être supportés par le Bailleur.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Exclusivité de Location :
                  </span>{" "}
                  Pendant la durée de ce contrat, le Bailleur s'engage à ne pas
                  louer d'autres espaces sur le même bâtiment à une société
                  concurrente de la Régie Publicitaire pour des ns d’af chage
                  publicitaire.
                </p>
              </div>
            </div>
            <div className="space-y-0.5">
              <h2 className="font-semibold text-xl underline">
                Article 4 : Obligations de la Régie Publicitaire
              </h2>
              <div className="space-y-2">
                <p className="[text-indent:2em]">
                  Dans le cadre de ce contrat de location pour l'utilisation de
                  la façade pour af chage publicitaire, La Régie Publicitaire
                  s'engage à respecter les obligations suivantes :
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Paiement de la Redevance :
                  </span>{" "}
                  En contrepartie de la location des emplacements, la Régie
                  Publicitaire paiera la redevance due conformément aux
                  dispositions de l'Article 5 du présent contrat. Les paiements
                  seront effectués aux échéances convenues et selon les
                  modalités spéci ées.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Démarches Administratives :
                  </span>{" "}
                  La Régie Publicitaire prendra en charge toutes les démarches
                  et obtiendra les autorisations administratives nécessaires à
                  la réalisation de ses projets d’af chage. Elle se conformera à
                  la réglementation en vigueur en matière de publicité et d’af
                  chage et s'acquittera de tous les droits, taxes, redevances et
                  autres frais y afférents. La Régie Publicitaire garantira le
                  Bailleur contre toute conséquence résultant du non-respect de
                  ces obligations.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Organisation et Responsabilité des Travaux :
                  </span>{" "}
                  La Régie Publicitaire mettra en place toute l’organisation
                  interne nécessaire et déploiera, sous sa seule et entière
                  responsabilité, tous les moyens adaptés à la bonne exécution
                  des travaux d’installation et de maintenance du dispositif.
                  Elle s’engage à respecter et à faire respecter les normes de
                  sécurité, particulièrement en ce qui concerne les travaux sur
                  un immeuble de plus de cinq (5) mètres de haut.
                </p>
                <p className="[text-indent:2em]">
                  <span className="font-semibold">
                    Usage Exclusif du Dispositif :
                  </span>{" "}
                  La Régie Publicitaire utilisera le dispositif exclusivement à
                  des ns d’af chage publicitaire, à l’exclusion de tout autre
                  usage. Elle veillera à ce que le contenu diffusé soit conforme
                  aux engagements pris dans l'Article 7 du présent contrat.
                </p>
              </div>
            </div>
          </div>
          <div className="items-center grid grid-cols-3">
            <p></p>
            <p className="font-semibold text-center">Contrat AC-FAC-003</p>
            <p className="text-sm text-end">2 sur 9</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
