import { getCountryFrenchName } from '@/lib/helper'
import { formatNumber } from '@/lib/utils'
import { ClientContractType } from '@/types/contract-types'
import React from 'react'

type ClientContractProps = {
    contract: ClientContractType
}

export default function ClientContract({ contract }: ClientContractProps) {
    return (
        <div id="contract" className='w-full'>
            <ContractPage title='Contrat AG-LOC-001' page='1'>
                <div className='pt-10 text-sm'>
                    <div className='mb-5 p-6 border-8 border-black'>
                        <h1 className='text-center'>
                            <span className='text-xl font-black'>
                                CONTRAT DE LOCATION DE PANNEAUX PUBLICITAIRES <br /> {getCountryFrenchName(contract.company.country)?.toUpperCase()}
                            </span>
                        </h1>
                    </div>
                    <div className='py-4'>
                        <h2 className='mb-5 text-base' ><span className='font-semibold'>D'autre part,</span></h2>
                        <ul className='mb-5'>
                            <li><span className='font-semibold'>Nom : </span> {contract.client.companyName}</li>
                            <li><span className='font-semibold'>Type : </span> {contract.client.businessSector}</li>
                            <li><span className='font-semibold'>Capital : </span> {contract.company.companyName}</li>
                            <li><span className='font-semibold'>Siège social : </span> {contract.company.companyName}</li>
                            <li><span className='font-semibold'>RCCM : </span> {contract.company.companyName}</li>
                            <li><span className='font-semibold'>NIU : </span> {contract.company.companyName}</li>
                        </ul>
                        <h2 className='mb-5 text-base'><span className='font-semibold'>Et d'autre part,</span></h2>
                        <ul className='mb-2'>
                            <li><span className='font-semibold'>Nom : </span> {contract.company.companyName}</li>
                            <li><span className='font-semibold'>Type : </span> {contract.company.businessActivityType}</li>
                            <li><span className='font-semibold'>Capital : </span> {formatNumber(contract.company.capitalAmount)} {contract.company.currency}</li>
                            <li><span className='font-semibold'>Siège social : </span> {contract.company.registeredAddress}</li>
                            <li><span className='font-semibold'>RCCM : </span> {contract.company.businessRegistrationNumber}</li>
                            <li><span className='font-semibold'>NIU : </span> {contract.company.taxIdentificationNumber}</li>
                        </ul>
                    </div>
                    <h2><span className='font-semibold'>Il a été convenu et arrêté ce qui suit :</span></h2>
                    <p className='mb-3 indent-10'>Les parties déclarent et garantissent posséder la capacité juridique nécessaire pour contracter et
                        s'engager au titre du présent contrat. Elles reconnaissent que le contrat a été négocié de manière équitable
                        et que chacune a eu la possibilité de consulter un conseiller juridique.</p>
                    <p className='mb-3 indent-10'>Le présent contrat est régi par les lois en vigueur de la République du {getCountryFrenchName(contract.company.country)?.toUpperCase()} et est sujet à
                        modi cation uniquement par accord écrit et signé par les deux parties.</p>
                    <p className='mb-3 indent-10'>Ce contrat prend effet à la date de sa signature par les deux parties et demeurera en vigueur jusqu'à
                        l'achèvement de toutes les obligations contractuelles, sauf résiliation anticipée conforme aux dispositions
                        établies dans les articles suivants.</p>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='2'>
                <div className='pt-5 text-sm'>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 1 - Objet</span></h2>
                        <p className='mb-2 indent-10'>Le présent contrat a pour objet la location de panneaux publicitaires par le Loueur à l'Annonceur.
                            Cette location est assujettie aux termes, conditions et stipulations détaillés dans ce contrat.</p>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Nature des Services</span> : Le Loueur met à disposition de l'Annonceur des espaces publicitaires
                            extérieurs, sous la forme de panneaux publicitaires, pour l'af chage de messages publicitaires ou
                            promotionnels de l'Annonceur. Les caractéristiques spéci ques de ces panneaux, y compris leur
                            emplacement, dimensions, modèle, et autres spéci cations techniques, sont détaillées dans l'Article 2 de ce
                            contrat.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Durée de la Location</span> : Chaque panneau publicitaire est loué pour une période dé nie, comme
                            spéci é individuellement dans l'Article 2. Cette période représente la durée pendant laquelle l'Annonceur a le
                            droit d'af cher ses messages publicitaires sur les panneaux respectifs.</p>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Usage des Panneaux</span> : L'Annonceur s'engage à utiliser les panneaux exclusivement à des ns
                            publicitaires ou promotionnelles, conformément aux lois et règlements en vigueur au PAYS, ainsi qu'aux
                            normes éthiques de la publicité. Tout contenu diffusé par l'Annonceur sur les panneaux doit préalablement
                            être approuvé par le Loueur, conformément aux modalités dé nies dans l'Article 4.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Exclusivité et Limitations</span> : Le Loueur garantit à l'Annonceur l'exclusivité de l'usage des panneaux
                            pendant la durée de la location. Le Loueur ne doit pas louer, allouer ou utiliser les panneaux spéci és pour
                            des tiers ou à des ns autres que celles stipulées dans ce contrat sans le consentement écrit préalable de
                            l'Annonceur.</p>
                        <p className='mb-2 indent-10'>Ce contrat est spéci que aux parties signataires et aux panneaux publicitaires décrits. Il ne couvre
                            pas d'autres services ou accords qui pourraient exister entre le Loueur et l'Annonceur. Toute modi cation ou
                            extension des services couverts par ce contrat nécessite un accord écrit supplémentaire entre les parties.</p>
                    </div>
                    <div>
                        <h2 ><span className='font-semibold text-base underline mb-2'>Article 2 - Description des Panneaux</span></h2>
                        <p className='indent-10 mb-2'>Les panneaux publicitaires objets du présent contrat sont décrits comme suit :</p>
                        <BillboardCard />
                        <BillboardCard />
                    </div>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='3'>
                <div className='pt-5 text-sm'>
                    <BillboardCard />
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 3 - Obligations du Loueur</span></h2>
                        <p className='mb-2 indent-10'>Dans le cadre de ce contrat, le Loueur, s'engage à respecter les obligations suivantes :</p>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Maintenance et Fonctionnement des Panneaux</span> : Le Loueur doit assurer la maintenance régulière
                            des panneaux pour garantir leur bon état et fonctionnement tout au long de la période de location. Cela
                            inclut, sans s'y limiter, la réparation des dommages, le maintien de l'éclairage fonctionnel, et la garantie de la
                            stabilité structurelle des panneaux.
                        </p>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Visibilité et Accessibilité</span> : Le Loueur garantit que chaque panneau loué sera visible et accessible
                            conformément aux descriptions fournies dans l'Article 2 du contrat. Si des obstacles imprévus
                            compromettent la visibilité ou l'accessibilité du panneau, le Loueur s'engage à prendre rapidement les
                            mesures nécessaires pour résoudre le problème.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Conformité avec les Réglementations</span> : Le Loueur assure que tous les panneaux loués sont en
                            conformité avec les réglementations locales, nationales et les normes de sécurité en vigueur. Le Loueur est
                            responsable de l'obtention et du maintien de toutes les autorisations, licences ou permis nécessaires pour
                            l'exploitation des panneaux publicitaires.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Installation et Retrait des Publicités</span> : Le Loueur est responsable de l'installation et du retrait des
                            contenus publicitaires de l'Annonceur sur les panneaux, conformément aux spéci cations et aux délais
                            convenus avec l’Annonceur. Le Loueur doit s'assurer que l'installation des publicités est effectuée de
                            manière professionnelle, sans endommager le matériel de l'Annonceur.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Assurance</span> : Le Loueur s'engage à maintenir une assurance adéquate couvrant les panneaux
                            publicitaires contre les dommages, le vandalisme et autres risques pertinents tout au long de la durée du
                            contrat.</p>
                        <p className='mb-2 indent-10'>
                            Le Loueur s'engage à respecter toutes ces obligations dans le cadre de la fourniture de services de
                            qualité et pour assurer la satisfaction de l'Annonceur.
                        </p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 4 - Obligations de l’Annonceur</span></h2>
                        <p className='mb-2 indent-10'>Dans le cadre de ce contrat, l'Annonceur, s'engage à respecter les obligations suivantes :</p>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Fourniture des Contenus Publicitaires</span> : L'Annonceur doit fournir tous les contenus publicitaires
                            destinés à être af chés sur les panneaux dans les délais et formats convenus avec le Loueur. Ces contenus
                            doivent être de qualité professionnelle et conformes aux spéci cations techniques établies par le Loueur.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Conformité Légale et Éthique des Publicités</span> : L'Annonceur s'engage à ce que tous les contenus
                            publicitaires respectent les lois, réglementations et normes éthiques en vigueur au {getCountryFrenchName(contract.company.country)?.toUpperCase()}, notamment en matière de publicité, de décence, et de non-discrimination. L'Annonceur garantit que les publicités ne portent
                            atteinte ni aux droits d'auteur, ni aux autres droits de propriété intellectuelle.</p>
                    </div>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='4'>
                <div className='pt-5 text-sm'>
                    <div className='mb-4'>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Approbation des Publicités</span> : Avant leur installation, les contenus publicitaires doivent être soumis
                            au Loueur pour approbation. Le Loueur se réserve le droit de refuser tout contenu jugé inapproprié ou non
                            conforme aux standards convenus.
                        </p>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Paiement</span> : L'Annonceur s'engage à effectuer tous les paiements relatifs à la location des panneaux
                            dans les délais et conditions énoncés dans l'Article 5 du présent contrat. En cas de retard de paiement,
                            l'Annonceur sera soumis aux pénalités ou intérêts de retard stipulés dans l'Article 5.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Responsabilité en Cas de Dommages</span> : L'Annonceur est responsable de tout dommage causé aux
                            panneaux publicitaires du fait de l'installation ou de la nature de ses publicités, sauf si de tels dommages
                            sont dus à une faute ou une négligence du Loueur.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Notification de Problèmes ou Changements</span> : L'Annonceur doit informer le Loueur sans délai de
                            tout problème ou changement concernant les publicités ou leur contenu, y compris mais sans s'y limiter, les
                            erreurs d'af chage, les besoins de modi cation ou de retrait des publicités.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Respect des Droits de Propriété et d'Exclusivité du Loueur</span> : L'Annonceur s'engage à ne pas
                            utiliser les panneaux à des ns autres que celles convenues dans ce contrat et à respecter les droits de
                            propriété et d'exclusivité du Loueur sur les panneaux.</p>
                        <p className='mb-2 indent-10'>
                            L'Annonceur doit respecter ces obligations pour assurer une collaboration ef cace et conforme aux
                            termes du contrat.
                        </p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 5 - Conditions de Paiement</span></h2>
                        <p className='mb-2 indent-10'>Les conditions de paiement régissant la location des panneaux publicitaires entre le Loueur et
                            l’Annonceur sont les suivantes :</p>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Montant Total de la Campagne</span> : Le montant total hors taxes (HT) pour l'ensemble de la campagne
                            de location des panneaux publicitaires, comme spéci é dans l'Article 2, est de 9 200 000 Francs CFA.
                            En y ajoutant les taxes, le montant total toutes taxes comprises (TTC) pour la campagne est de 10 292 000
                            Francs CFA mentionné dans les factures AB-101 et AB-102.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Facturation</span> : Le Loueur émettra une facture pour les services de location des panneaux
                            publicitaires conformément aux tarifs et périodes spéci és dans l'Article 2 du présent contrat. Chaque facture
                            détaillera les coûts associés à chaque panneau publicitaire et la période correspondante de location.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Délai de Paiement</span> : L'Annonceur s'engage à régler chaque facture dans un délai de 30 jours à
                            compter de la date d'émission de la facture sauf accord spéci que établit entre les deux parties. Le paiement
                            est considéré comme effectué à la date à laquelle les fonds sont reçus sur le compte bancaire du Loueur.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Mode de Paiement</span> : Les paiements doivent être effectués par l'Annonceur par virement bancaire au
                            compte indiqué par le Loueur, par cheque à l’ordre indiqué sur la facture ou pas espèces auprès du service
                            financier du Loueur. Les frais de virement sont à la charge de l’Annonceur.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Retard de Paiement</span> : Si le retard excède 30 jours, le Loueur se réserve le droit de suspendre la
                            prestation des services jusqu'à la réception du paiement intégral sauf accord spéci que établit entre les deux
                            parties.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Conséquences du Non-Paiement</span> : En cas de non-paiement persistant au-delà des périodes
                            stipulées, le Loueur se réserve le droit d'engager des procédures judiciaires pour recouvrer les montants
                            dus, ainsi que de résilier le contrat conformément aux conditions énoncées dans l'Article 10 sur la résiliation.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Révisions et Ajustements</span> : Toute révision des tarifs ou des conditions de paiement en cours de
                            contrat doit être convenue par écrit entre le Loueur et l'Annonceur.</p>

                        <p className='mb-2 indent-10'>
                            L'Annonceur reconnaît et accepte ces conditions de paiement comme partie intégrante du contrat de
                            location des panneaux publicitaires.
                        </p>
                    </div>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='5'>
                <div className='pt-5 text-sm'>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 6 - Clauses de Con dentialité et de Non-Divulgation</span></h2>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Définition des Informations Confidentielles</span> : Les informations confidentielles comprennent, sans
                            s'y limiter, toutes données, informations, documents, logiciels, techniques, stratégies commerciales, plans
                            marketing, détails financiers, et autres informations liées aux activités ou aux opérations des parties, qui sont
                            divulguées ou échangées, directement ou indirectement, dans le cadre de ce contrat.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Obligation de Confidentialité</span> : Les parties s'engagent à maintenir la confidentialité des
                            informations confidentielles reçues de l'autre partie. Elles ne doivent pas utiliser ces informations à des fins
                            autres que l'exécution des obligations découlant du présent contrat. Cette obligation de confidentialité
                            restera en vigueur pendant toute la durée du contrat et pour une période de trois (3) années après sa
                            résiliation ou son expiration.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Restrictions de Divulgation</span> : Les informations confidentielles ne peuvent être divulguées à des
                            tiers sans le consentement écrit préalable de la partie qui les a fournies. Toutefois, les informations peuvent
                            être divulguées si elles sont requises par la loi ou par une autorité réglementaire, à condition que la partie
                            concernée en informe l'autre partie dans les meilleurs délais.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Mesures de Protection</span> : Les parties s'engagent à prendre toutes les mesures nécessaires pour
                            protéger la confidentialité des informations et à ne permettre l'accès qu'aux employés ou agents ayant
                            besoin de connaître ces informations dans le cadre de leurs fonctions.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Retour ou Destruction des Informations</span> : À la fin du contrat ou à la demande de la partie
                            divulgatrice, toutes les informations confidentielles, y compris les copies, doivent être retournées ou
                            détruites, selon les instructions de la partie divulgatrice.</p>

                        <p className='indent-10'><span className='font-semibold'>Conséquences en cas de Violation</span> : En cas de violation de ces clauses de confidentialité, la partie
                            lésée aura le droit de demander des mesures correctives, y compris des dommages-intérêts, et de prendre
                            toutes les mesures judiciaires nécessaires pour protéger ses intérêts.</p>

                        <p className='mb-2'>Cette clause vise à protéger les intérêts commerciaux et la propriété intellectuelle des parties et à favoriser
                            un environnement de con ance mutuelle pour la réalisation ef cace du contrat.</p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 6 - Clauses de Con dentialité et de Non-Divulgation</span></h2>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Interdiction de Contournement</span> : L'Annonceur s'engage à ne pas contourner, directement ou
                            indirectement, le Loueur pour négocier ou conclure des contrats relatifs à la location des panneaux
                            publicitaires ou à des services similaires avec les propriétaires des sites des panneaux ou toute autre partie
                            associée, sans le consentement écrit préalable du Loueur. Cette interdiction s'applique pendant toute la
                            durée du contrat et pour une période de trois (3) années suivant sa résiliation ou son expiration.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Protection des Relations Commerciales</span> : La clause de non-contournement est conçue pour
                            protéger les relations commerciales et les accords exclusifs établis par le Loueur avec les propriétaires des
                            sites et autres parties. L'Annonceur reconnaît que le non-respect de cette clause pourrait causer un
                            préjudice signi catif au Loueur.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Notification Obligatoire</span> : Si l'Annonceur est approché par un tiers en relation avec les services
                            couverts par ce contrat, l'Annonceur doit en informer le Loueur et diriger ledit tiers vers le Loueur pour toute
                            négociation ou discussion.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Conséquences en cas de Violation</span>Conséquences en cas de Violation : En cas de violation de cette clause de non-contournement, le
                            Loueur aura le droit de prendre des mesures correctives, y compris de réclamer des dommages-intérêts et
                            d'engager des procédures judiciaires pour protéger ses intérêts commerciaux.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Reconnaissance de la Valeur Commerciale</span> : En acceptant les termes de cette clause,
                            l'Annonceur reconnaît la valeur commerciale des relations et des accords établis par le Loueur et s'engage à respecter la nature exclusive de ces relations dans le cadre de ce contrat. Cette clause vise à maintenir
                            l'intégrité des relations commerciales et à prévenir toute tentative de contournement qui pourrait nuire aux
                            intérêts commerciaux du Loueur.</p>
                    </div>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='6'>
                <div className='pt-5 text-sm'>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 8 - Force Majeure</span></h2>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Définition de la Force Majeure</span> : Une force majeure est un événement ou une série d'événements
                            imprévisibles et irrésistibles, tels que des catastrophes naturelles (tremblements de terre, inondations,
                            ouragans), des con its armés, des grèves nationales, des épidémies, des actes de terrorisme, ou des
                            changements signi catifs de la réglementation, qui rendent impossible l'exécution normale des obligations
                            contractuelles par l'une des parties.
                        </p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Notification de la Force Majeure</span> : La partie affectée par un événement de force majeure doit
                            informer l'autre partie par écrit dans un délai raisonnable, en général dans les dix (10) jours suivant la
                            survenue ou la connaissance de l’événement. Cette noti cation doit décrire la nature de l'événement de
                            force majeure, ainsi que son impact estimé sur les obligations de la partie affectée.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Suspension des Obligations</span> : Si l'une des parties est empêchée de remplir ses obligations
                            contractuelles en raison d'un événement de force majeure, ses obligations seront suspendues pendant la
                            durée de cet événement, sans qu'elle ne soit tenue responsable pour ce retard ou cette non-exécution. La
                            partie affectée doit faire tous les efforts raisonnables pour limiter les conséquences de l'événement de force
                            majeure et reprendre l'exécution complète de ses obligations dès que possible.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Renégociation ou Résiliation du Contrat</span> : Si l'événement de force majeure persiste au-delà d'une
                            période de trente (30) jours, les parties devront renégocier de bonne foi les termes du contrat pour s'adapter
                            à la nouvelle situation. Si l'événement de force majeure rend impossible l'exécution du contrat sur une
                            période prolongée, l'une des parties peut choisir de résilier le contrat sans pénalité.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Exclusions</span> : Les problèmes nanciers ou les changements dans les conditions du marché ne sont
                            pas considérés comme des cas de force majeure.</p>
                        <p className='mb-2'>La présente clause vise à fournir un cadre clair pour la gestion des circonstances imprévues qui
                            échappent au contrôle des parties et à préserver l'équité dans l'exécution du contrat.</p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 9 - Modi cation du Contrat</span></h2>
                        <p className='mb-2 indent-10'>
                            <span className='font-semibold'>Procédure de Modification</span> : Toute modi cation, ajout ou suppression de clauses du présent
                            contrat doit être réalisée par écrit. Les modi cations doivent être clairement formulées et convenues
                            mutuellement par les deux parties. Une modi cation n'est considérée comme valide et exécutoire que si elle
                            est formalisée dans un document signé par les représentants dûment autorisés des deux parties.
                        </p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Forme Écrite Exigée</span> : Les modi cations verbales ou informelles, y compris celles communiquées
                            par téléphone, courriel ou tout autre moyen de communication électronique, ne sont pas reconnues comme
                            valides aux ns de modi cation du présent contrat. Seules les modi cations documentées par écrit et portant
                            les signatures des deux parties sont considérées comme légalement contraignantes.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Consentement Mutuel</span> : Les modi cations apportées au contrat ne peuvent être mises en œuvre
                            sans le consentement explicite et mutuel des deux parties. Chaque partie doit avoir l'opportunité d'examiner
                            et de discuter de toute proposition de modi cation avant de donner son accord.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Non-Affectation des Obligations Préexistantes</span> : Toute modification apportée au contrat
                            n'affectera pas les droits et obligations nés sous le régime du contrat avant la modi cation, sauf si cela est
                            expressément convenu dans l'accord de modification.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Notification et Enregistrement des Modifications</span> : Une fois signée, une copie de la modification
                            doit être fournie à chaque partie pour être conservée avec le contrat original. Il est recommandé d'enregistrer
                            ou de noti er les modi cations conformément aux exigences légales ou réglementaires applicables.</p>
                    </div>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='7'>
                <div className='pt-5 text-sm'>
                    <div className='mb-4'>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Date d'Entrée en Vigueur</span> : Les modi cations entrent en vigueur à la date spéci ée dans l'accord
                            de modification, ou, si aucune date n'est spéci ée, à la date de la dernière signature apposée sur l'accord de
                            modification.</p>
                        <p className='mb-2 indent-10'>La présente clause garantit que toutes les modi cations du contrat sont effectuées de manière
                            transparente, équitable et juridiquement valide, en préservant les intérêts et les attentes des deux parties.</p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 10 - Résiliation</span></h2>
                        <p className='indent-10'>
                            <span className='font-semibold'>Conditions de Résiliation Anticipée</span> : Chacune des parties a le droit de résilier ce contrat avant
                            son terme dans les cas suivants :
                        </p>
                        <ul className='indent-14 mb-2'>
                            <li>• Violation substantielle des termes du contrat par l'autre partie, non recti ée dans un délai de dix
                                (10) jours après noti cation écrite de cette violation.</li>
                            <li>• Insolvabilité, faillite ou mise en liquidation de l'autre partie.</li>
                            <li>• Changement signi catif des circonstances rendant l'exécution du contrat impossible ou
                                excessivement onéreuse.</li>
                        </ul>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Notification de Résiliation</span> : Toute intention de résilier le contrat doit être communiquée par écrit à
                            l'autre partie, en spéci ant clairement les raisons de la résiliation.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Effets de la Résiliation</span> : À la résiliation du contrat, toutes les obligations des parties prennent n,
                            sauf celles qui, par leur nature, devraient survivre à la résiliation (comme les obligations de con dentialité ou
                            de non-contournement). L'Annonceur devra régler toutes les sommes dues jusqu'à la date de résiliation
                            effective.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Restitution des Propriétés</span> : À la résiliation du contrat, l'Annonceur doit cesser immédiatement
                            d'utiliser les panneaux publicitaires et permettre au Loueur de reprendre possession de ceux-ci. Toute
                            propriété appartenant à l'une des parties et se trouvant en possession de l'autre partie doit être restituée
                            dans les dix (10) jours suivant la date de résiliation.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Pénalités de Résiliation</span> : En cas de résiliation pour faute de l'Annonceur, des pénalités peuvent
                            être appliquées, telles que dé nies dans les termes du contrat.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Clause de Non-Contestation</span> : Les parties s'engagent à ne pas contester la validité de la résiliation
                            lorsqu'elle est effectuée conformément aux termes de cette clause.</p>

                        <p className='mb-2 indent-10'>La présente clause de résiliation permet une cessation ordonnée et équitable du contrat en cas de
                            nécessité, en protégeant les droits et intérêts de chaque partie.</p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 11 - Responsabilité et Assurance</span></h2>
                        <p className='indent-10'>
                            <span className='font-semibold'>Responsabilité Générale</span> : Chaque partie, ainsi que leurs sous-traitants, assument l'entière
                            responsabilité des dommages corporels, matériels ou de toute autre nature causés à des tiers dans le cadre
                            de l'exécution du présent contrat. Cette responsabilité est régie par le droit commun applicable.
                        </p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Assurance Responsabilité Civile</span> : les parties déclarent chacune détenir une police d'assurance
                            responsabilité civile appropriée, couvrant les risques liés à leurs activités et responsabilités respectives dans
                            le cadre de ce contrat. Les polices d'assurance doivent couvrir suf samment tous les dommages potentiels
                            et les responsabilités qui pourraient découler de l'exécution ou de la non-exécution des obligations
                            contractuelles.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Responsabilité des Sous-Traitants</span> : Les parties s'engagent à ce que tous leurs sous-traitants
                            soient également couverts par une assurance responsabilité civile adéquate. En cas de dommage causé par
                            les sous-traitants de l'une des parties, cette partie sera tenue responsable et devra assumer les
                            conséquences de la responsabilité civile de ses sous-traitants.</p>
                    </div>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='8'>
                <div className='pt-5 text-sm'>
                    <div className='mb-4'>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Preuve d'Assurance</span> : Sur demande, chaque partie doit être en mesure de fournir une preuve de sa
                            couverture d'assurance à l'autre partie. Les parties s'engagent à maintenir leurs polices d'assurance en
                            vigueur tout au long de la durée du contrat.</p>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Gestion des Sinistres</span> : En cas de sinistre impliquant une responsabilité couverte par les polices
                            d'assurance, la partie concernée s'engage à prendre en charge la gestion et le suivi du sinistre en
                            coordination avec son assureur.</p>
                        <p className='indent-10'>
                            La présente clause assure que les parties disposent de protections adéquates contre les risques liés
                            à l'exécution du contrat et démontre leur engagement à gérer de manière responsable toute responsabilité
                            potentielle.
                        </p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 12 – Intégralité du contrat</span></h2>
                        <p className='indent-10'>
                            Le présent contrat y compris ses annexes exprime l’intégralité des obligations des parties et prévaut
                            sur tous les engagements écrits ou verbaux préalables entre les parties.
                        </p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 13 - Droit Applicable et Résolution des Conflits</span></h2>
                        <p className='indent-10'>
                            <span className='font-semibold'>Droit Applicable</span> : Le présent contrat est régi et interprété conformément aux lois de la République
                            du PAYS. Toutes les activités entreprises dans le cadre de ce contrat seront conformes à la législation en
                            vigueur au PAYS. Les parties s'engagent à respecter toutes les lois et réglementations locales applicables à
                            l'exécution du contrat.
                        </p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Résolution Amiable des Conflits</span> : En cas de désaccord ou de litige découlant de ou lié à ce
                            contrat, les parties s'engagent d'abord à tenter une résolution à l’amiable. Cette démarche implique des
                            discussions de bonne foi entre les représentants des parties, dans un délai de vingts (20) jours suivant la
                            noti cation écrite du désaccord ou du litige.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Médiation</span> : Si la résolution amiable échoue, les parties peuvent convenir de soumettre le différend à
                            une médiation avant de prendre toute mesure judiciaire. La médiation sera menée par un médiateur neutre
                            et quali é, choisi d'un commun accord par les parties.</p>


                        <p className='mb-2 indent-10'><span className='font-semibold'>Arbitrage</span> : En cas d'échec de la médiation, ou si les parties choisissent de ne pas opter pour la
                            médiation, tout litige sera résolu par arbitrage. L'arbitrage sera mené conformément aux règles d'arbitrage
                            de la Chambre de Commerce Internationale ou d'un autre organisme d'arbitrage agréé, avec un siège
                            d'arbitrage situé à VILLE.</p>


                        <p className='mb-2 indent-10'><span className='font-semibold'>Exécution des Décisions</span> : Les décisions issues de la médiation ou de l'arbitrage seront nales et
                            contraignantes pour les parties et pourront être exécutées dans toute juridiction compétente.</p>


                        <p className='mb-2 indent-10'><span className='font-semibold'>Frais de Résolution des Conflits</span> : Les frais engendrés par la médiation ou l'arbitrage, y compris
                            les honoraires des médiateurs ou arbitres, seront partagés équitablement entre les parties, sauf décision
                            contraire du médiateur ou de l’arbitre.</p>

                        <p className='mb-2 indent-10'>La présente clause vise à assurer une résolution ef cace et équitable des différends, minimisant le
                            besoin de recourir à des procédures judiciaires longues et coûteuses.</p>
                    </div>
                    <div className='mb-4'>
                        <h2><span className='font-semibold text-base underline mb-2'>Article 14 - Noti cations et Communications</span></h2>
                        <p className='indent-10'>
                            <span className='font-semibold'>Moyens de Communication Formels</span> : Toutes les noti cations, demandes, approbations et autres
                            communications requises ou permises par ce contrat doivent être effectuées par écrit. Les communications
                            of cielles doivent être envoyées par courrier recommandé, courrier électronique avec accusé de réception,
                            ou tout autre moyen permettant de prouver leur réception.
                        </p>
                    </div>
                </div>
            </ContractPage>
            <ContractPage title='Contrat AG-LOC-001' page='9'>
                <div className='pt-5 text-sm'>
                    <div className='mb-4'>
                        <p className='mb-2 indent-10'><span className='font-semibold'>Adresses de Notification</span> : Les noti cations a l’annonceur doivent être envoyées à l'adresse
                            suivante : info@total.com ou par téléphone au +242 06 000 00 00, ou à toute autre adresse que le Bailleur
                            pourrait désigner par écrit ultérieurement. Les noti cations à La Régie Publicitaire doivent être envoyées à
                            l'adresse suivante : info@atlascongo.com ou au +242 06 413 80 00, ou à toute autre adresse que La Régie
                            Publicitaire pourrait désigner par écrit ultérieurement.</p>

                        <p className='indent-10'>
                            <span className='font-semibold'>Délais de Réception</span> : Une noti cation est considérée comme reçue :
                        </p>
                        <ul className='indent-14 mb-2'>
                            <li>• le jour de sa réception si elle est livrée en main propre ;</li>
                            <li>• le jour de l'envoi si elle est transmise par courrier électronique avec accusé de réception ;</li>
                            <li>• ou dans les dix (10) jours ouvrables après son envoi si elle est expédiée par courrier
                                recommandé.</li>
                        </ul>


                        <p className='mb-2 indent-10'><span className='font-semibold'>Changements d'Adresse</span> : Si l'une des parties change son adresse de communication, elle doit en
                            informer l'autre partie par écrit dans un délai de trente (30) jours.</p>

                        <p className='mb-2 indent-10'><span className='font-semibold'>Langue de Communication</span> : Toutes les communications et noti cations liées à ce contrat doivent
                            être rédigées en français, qui est la langue of cielle du contrat.</p>

                        <p className='mb-16 indent-10'><span className='font-semibold'>Preuve de l'Envoi</span> : Pour les communications effectuées par courrier électronique, l'accusé de
                            réception fera foi de la réception. Pour les envois par courrier, l'accusé de réception postal ou le reçu de
                            livraison servira de preuve de réception.
                            La présente clause garantit que toutes les communications importantes liées au contrat sont réalisées de
                            manière formelle, claire et traçable, évitant ainsi les malentendus et fournissant une trace documentée en
                            cas de besoin.</p>

                        <div className='grid grid-cols-2'>
                            <div>
                                <h2 className='mb-4'><span className='font-semibold text-base underline'>Pour le Loueur :</span></h2>
                                <p className='mb-4'>Nom : _______________________________</p>
                                <p className='mb-4'>Titre : _______________________________</p>
                                <p className='mb-4'>Signature :</p>
                            </div>
                            <div>
                                <h2 className='mb-4'><span className='font-semibold text-base underline'>Pour l’Annonceur :</span></h2>
                                <p className='mb-4'>Nom : _______________________________</p>
                                <p className='mb-4'>Titre : _______________________________</p>
                                <p className='mb-4'>Signature :</p>
                            </div>
                        </div>

                    </div>

                </div>
            </ContractPage>
        </div>
    )
}


type ContractPageProps = {
    children: React.ReactNode;
    title: string;
    page: string;
}

function ContractPage({ children, title, page }: ContractPageProps) {
    return <div className='bg-neutral-100 h-[297mm] flex flex-col justify-between'>
        <div className='px-6'>
            {children}
        </div>
        <div className='grid grid-cols-3 text-sm px-6 py-4'>
            <div></div>
            <div className='text-center'>
                <p>{title}</p>
            </div>
            <div className='flex justify-end'>
                <p>{page} sur 9</p>
            </div>
        </div>
    </div>
}


function BillboardCard() {
    return <div className='pl-10 text-sm -space-y-0.5 mb-2'>
        <h2><span className='font-semibold'>Panneau 1</span></h2>
        <ul className='pl-10'>
            <li><span className='font-semibold'>Référence</span> : P-001-LBV</li>
            <li><span className='font-semibold'>Modèle</span> : Panneau sur pied</li>
            <li><span className='font-semibold'>Dimensions</span> : 20m x 6m</li>
            <li><span className='font-semibold'>Superficie</span> : 152m2</li>
            <li><span className='font-semibold'>Site</span> : Tractafric</li>
            <li><span className='font-semibold'>Éclairage</span> : Oui</li>
            <li><span className='font-semibold'>Période de location</span> : 01/01/2024 au 01/04/2024</li>
            <li><span className='font-semibold'>Durée</span> : 3 mois</li>
            <li><span className='font-semibold'>Prix de location (FCFA HT)</span> : 1.000.000</li>
            <li><span className='font-semibold'>Prix total sur la période (FCFA HT)</span> : 3.000.000</li>
        </ul>
    </div>
}