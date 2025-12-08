import { ContractLessorType, ContractType } from '@/types/contract-types';
import { Document, Packer, Paragraph, TableRow, Table, PageBreak } from 'docx';
import { formatList, formatNumber } from './utils';
import { cell, clientContractOwner, companyContractOwner, createBillboardParagraphs, createFooter, createHeader, createImagesTable, createText, createTitle, createTitleContent, lessorContractOwner } from './word-utils';
import { formatDateToDashModel, getMonthsAndDaysDifference } from './date';

export async function generateClientContractDocument(contract: ContractType): Promise<Blob> {
    const doc = new Document({
        sections: [
            {
                properties: {},
                footers: {
                    default: createFooter(contract.filename)
                },

                children: [
                    createHeader(contract.company.country, 'CLIENT'),

                    createTitle({ text: "D'une part,", bold: true, size: 12 }),
                    createTitleContent({ title: 'Nom', content: contract.client.company }),
                    createTitleContent({ title: 'Type', content: contract.client.legalForm }),
                    createTitleContent({ title: 'Capital', content: `${formatNumber(contract.client.capital)} ${contract.company.currency}` }),
                    createTitleContent({ title: 'Registre du Commerce et du Crédit Mobilier (RCCM)', content: contract.client.rccm }),
                    createTitleContent({ title: 'Numéro fiscal', content: contract.client.nif ?? "" }),
                    createTitleContent({ title: 'Siège social', content: contract.client.address }),
                    clientContractOwner(`${contract.client.representativeName}`, `${contract.client.representativeJob || "-"}`),

                    createTitle({ text: "Et d'autre part,", bold: true, size: 12 }),
                    createTitleContent({ title: 'Nom', content: contract.company.name }),
                    createTitleContent({ title: 'Type', content: contract.company.legalForm }),
                    createTitleContent({ title: 'Capital', content: `${formatNumber(contract.company.capital)} ${contract.company.currency}` }),
                    createTitleContent({ title: 'Siège social', content: contract.company.address }),
                    createTitleContent({ title: 'RCCM', content: contract.company.rccm }),
                    createTitleContent({ title: 'NIU', content: contract.company.niu ?? "" }),
                    companyContractOwner(`${contract.company.representativeName}`, contract.client.representativeJob || "",),
                    createTitle({ text: "D'autre part.", bold: false, paddingTop: 0 }),

                    createTitle({ text: "Il a été convenu et arrêté ce qui suit :", bold: true, paddingTop: 0, paddingBottom: 0 }),
                    createText("Les parties déclarent et garantissent posséder la capacité juridique nécessaire pour contracter et s'engager au titre du présent contrat. Elles reconnaissent que le contrat a été négocié de manière équitable et que chacune a eu la possibilité de consulter un conseiller juridique."),
                    createText(`Le présent contrat est régi par les lois en vigueur du ${contract.company.country} et est sujet à modification uniquement par accord écrit et signé par les deux parties.`),
                    createText("Ce contrat prend effet à la date de sa signature par les deux parties et demeurera en vigueur jusqu'à l'achèvement de toutes les obligations contractuelles, sauf résiliation anticipée conforme aux dispositions établies dans les articles suivants."),
                    new Paragraph({ children: [new PageBreak()] }),

                    // Article 1
                    createTitle({ text: "Article 1 - Objet", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText("Le présent contrat a pour objet la location de panneaux publicitaires par le Loueur à l'Annonceur. Cette location est assujettie aux termes, conditions et stipulations détaillés dans ce contrat."),

                    createTitleContent({
                        indent: 720,
                        title: "Nature des Services", content: `Le Loueur met à disposition de l'Annonceur des espaces publicitaires
extérieurs, sous la forme de panneaux publicitaires, pour l'affichage de messages publicitaires ou
promotionnels de l'Annonceur. Les caractéristiques spécifiques de ces panneaux, y compris leur
emplacement, dimensions, modèle, et autres spécifications techniques, sont détaillées dans l'Article 2 de ce
contrat.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Durée de la Location", content: `Chaque panneau publicitaire est loué pour une période définie, comme
spécifié individuellement dans l'Article 2. Cette période représente la durée pendant laquelle l'Annonceur a le
droit d'afficher ses messages publicitaires sur les panneaux respectifs.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Usage des Panneaux", content: `L'Annonceur s'engage à utiliser les panneaux exclusivement à des fins
publicitaires ou promotionnelles, conformément aux lois et règlements en vigueur au ${contract.company.country}, ainsi qu'aux
normes éthiques de la publicité. Tout contenu diffusé par l'Annonceur sur les panneaux doit préalablement
être approuvé par le Loueur, conformément aux modalités dé nies dans l'Article 4.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Exclusivité et Limitations", content: `Le Loueur garantit à l'Annonceur l'exclusivité de l'usage des panneaux
pendant la durée de la location. Le Loueur ne doit pas louer, allouer ou utiliser les panneaux spécifiés pour
des tiers ou à des fins autres que celles stipulées dans ce contrat sans le consentement écrit préalable de
l'Annonceur.`, paddingBottom: 100
                    }),

                    createText(`Ce contrat est spécifique aux parties signataires et aux panneaux publicitaires décrits. Il ne couvre
pas d'autres services ou accords qui pourraient exister entre le Loueur et l'Annonceur. Toute modification ou
extension des services couverts par ce contrat nécessite un accord écrit supplémentaire entre les parties.`),


                    // Article 2
                    createTitle({ text: "Article 2 - Description des Panneaux", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Les panneaux publicitaires objets du présent contrat sont décrits comme suit :`),
                    ...contract.items.flatMap((item, index) => createBillboardParagraphs(item, contract.company.currency, index + 1)),

                    // Article 3
                    createTitle({ text: "Article 3 - Obligations du Loueur", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Dans le cadre de ce contrat, le Loueur, s'engage à respecter les obligations suivantes :`),
                    createTitleContent({
                        indent: 720,
                        title: "Maintenance et Fonctionnement des Panneaux", content: `Le Loueur doit assurer la maintenance régulière
des panneaux pour garantir leur bon état et fonctionnement tout au long de la période de location. Cela
inclut, sans s'y limiter, la réparation des dommages, le maintien de l'éclairage fonctionnel, et la garantie de la
stabilité structurelle des panneaux.`, paddingBottom: 100
                    }),
                    createText(`Le Loueur doit prendre toutes les mesures nécessaires pour minimiser les interruptions de service
et, en cas de défaillance du panneau, s'engage à effectuer les réparations dans les plus brefs délais.`),

                    createTitleContent({
                        indent: 720,
                        title: "Visibilité et Accessibilité", content: `Le Loueur garantit que chaque panneau loué sera visible et accessible
conformément aux descriptions fournies dans l'Article 2 du contrat. Si des obstacles imprévus
compromettent la visibilité ou l'accessibilité du panneau, le Loueur s'engage à prendre rapidement les
mesures nécessaires pour résoudre le problème.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Conformité avec les Réglementations", content: `Le Loueur assure que tous les panneaux loués sont en
conformité avec les réglementations locales, nationales et les normes de sécurité en vigueur. Le Loueur est
responsable de l'obtention et du maintien de toutes les autorisations, licences ou permis nécessaires pour
l'exploitation des panneaux publicitaires.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Installation et Retrait des Publicités", content: `Le Loueur est responsable de l'installation et du retrait des
contenus publicitaires de l'Annonceur sur les panneaux, conformément aux spécifications et aux délais
convenus avec l’Annonceur. Le Loueur doit s'assurer que l'installation des publicités est effectuée de
manière professionnelle, sans endommager le matériel de l'Annonceur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Assurance", content: `Le Loueur s'engage à maintenir une assurance adéquate couvrant les panneaux
publicitaires contre les dommages, le vandalisme et autres risques pertinents tout au long de la durée du
contrat.`, paddingBottom: 100
                    }),
                    createText(`Le Loueur s'engage à respecter toutes ces obligations dans le cadre de la fourniture de services de
qualité et pour assurer la satisfaction de l'Annonceur.`),

                    // Article 4
                    createTitle({ text: "Article 4 - Obligations de l’Annonceur", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Fourniture des Contenus Publicitaires", content: `L'Annonceur doit fournir tous les contenus publicitaires
destinés à être affichés sur les panneaux dans les délais et formats convenus avec le Loueur. Ces contenus
doivent être de qualité professionnelle et conformes aux spécifications techniques établies par le Loueur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Conformité Légale et Éthique des Publicités", content: `L'Annonceur s'engage à ce que tous les contenus
publicitaires respectent les lois, réglementations et normes éthiques en vigueur au ${contract.company.country}, notamment en matière de publicité, de décence, et de non-discrimination. L'Annonceur garantit que les publicités ne portent
atteinte ni aux droits d'auteur, ni aux autres droits de propriété intellectuelle.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Approbation des Publicités", content: `Avant leur installation, les contenus publicitaires doivent être soumis
au Loueur pour approbation. Le Loueur se réserve le droit de refuser tout contenu jugé inapproprié ou non
conforme aux standards convenus.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Paiement", content: `L'Annonceur s'engage à effectuer tous les paiements relatifs à la location des panneaux
dans les délais et conditions énoncés dans l'Article 5 du présent contrat. En cas de retard de paiement,
l'Annonceur sera soumis aux pénalités ou intérêts de retard stipulés dans l'Article 5.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Responsabilité en Cas de Dommages", content: `L'Annonceur est responsable de tout dommage causé aux
panneaux publicitaires du fait de l'installation ou de la nature de ses publicités, sauf si de tels dommages
sont dus à une faute ou une négligence du Loueur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification de Problèmes ou Changements", content: `L'Annonceur doit informer le Loueur sans délai de
tout problème ou changement concernant les publicités ou leur contenu, y compris mais sans s'y limiter, les
erreurs d'affichage, les besoins de modification ou de retrait des publicités.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Respect des Droits de Propriété et d'Exclusivité du Loueur", content: `L'Annonceur s'engage à ne pas
utiliser les panneaux à des fins autres que celles convenues dans ce contrat et à respecter les droits de
propriété et d'exclusivité du Loueur sur les panneaux.`, paddingBottom: 100
                    }),
                    createText(`L'Annonceur doit respecter ces obligations pour assurer une collaboration efficace et conforme aux
termes du contrat.`),

                    // Article 5
                    createTitle({ text: "Article 5 - Conditions de Paiement", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Les conditions de paiement régissant la location des panneaux publicitaires entre le Loueur et
l’Annonceur sont les suivantes :`),

                    createTitleContent({
                        indent: 720,
                        title: "Montant Total de la Campagne", content: `Le montant total hors taxes (HT) pour l'ensemble de la campagne
de location des panneaux publicitaires, comme spécifié dans l'Article 2, est de ${contract.totalHT}  ${contract.company.currency}
En y ajoutant les taxes, le montant total toutes taxes comprises (TTC) pour la campagne est de  ${contract.totalTTC} ${contract.company.currency}
mentionné dans ${contract.record.length > 1 ? "les" : "la"} facture${contract.record.length > 1 ? "s" : ""} ${formatList(contract.record)}.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Facturation", content: `Le Loueur émettra une facture pour les services de location des panneaux
publicitaires conformément aux tarifs et périodes spécifiés dans l'Article 2 du présent contrat. Chaque facture
détaillera les coûts associés à chaque panneau publicitaire et la période correspondante de location.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Délai de Paiement", content: `L'Annonceur s'engage à régler chaque facture dans un délai de 30 jours à
compter de la date d'émission de la facture sauf accord spécifique établit entre les deux parties. Le paiement
est considéré comme effectué à la date à laquelle les fonds sont reçus sur le compte bancaire du Loueur.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Mode de Paiement", content: `Les paiements doivent être effectués par l'Annonceur par virement bancaire au
compte indiqué par le Loueur, par cheque à l’ordre indiqué sur la facture ou pas espèces auprès du service
financier du Loueur. Les frais de virement sont à la charge de l’Annonceur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Retard de Paiement", content: `Si le retard excède 30 jours, le Loueur se réserve le droit de suspendre la
prestation des services jusqu'à la réception du paiement intégral sauf accord spécifique établit entre les deux
parties.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Conséquences du Non-Paiement", content: `En cas de non-paiement persistant au-delà des périodes
stipulées, le Loueur se réserve le droit d'engager des procédures judiciaires pour recouvrer les montants
dus, ainsi que de résilier le contrat conformément aux conditions énoncées dans l'Article 10 sur la résiliation.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Révisions et Ajustements", content: `Toute révision des tarifs ou des conditions de paiement en cours de
contrat doit être convenue par écrit entre le Loueur et l'Annonceur.`, paddingBottom: 100
                    }),
                    createText(`L'Annonceur reconnaît et accepte ces conditions de paiement comme partie intégrante du contrat de
location des panneaux publicitaires.`),

                    // Article 6
                    createTitle({ text: "Article 6 - Clauses de Confidentialité et de Non-Divulgation", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createTitleContent({
                        indent: 720,
                        title: "Définition des Informations Confidentielles", content: `Les informations confidentielles comprennent, sans
s'y limiter, toutes données, informations, documents, logiciels, techniques, stratégies commerciales, plans
marketing, détails financiers, et autres informations liées aux activités ou aux opérations des parties, qui sont
divulguées ou échangées, directement ou indirectement, dans le cadre de ce contrat.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Obligation de Confidentialité", content: `Les parties s'engagent à maintenir la confidentialité des
informations confidentielles reçues de l'autre partie. Elles ne doivent pas utiliser ces informations à des fins
autres que l'exécution des obligations découlant du présent contrat. Cette obligation de confidentialité
restera en vigueur pendant toute la durée du contrat et pour une période de trois (3) années après sa
résiliation ou son expiration.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Restrictions de Divulgation", content: `Les informations confidentielles ne peuvent être divulguées à des
tiers sans le consentement écrit préalable de la partie qui les a fournies. Toutefois, les informations peuvent
être divulguées si elles sont requises par la loi ou par une autorité réglementaire, à condition que la partie
concernée en informe l'autre partie dans les meilleurs délais.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Mesures de Protection", content: `Les parties s'engagent à prendre toutes les mesures nécessaires pour
protéger la confidentialité des informations et à ne permettre l'accès qu'aux employés ou agents ayant
besoin de connaître ces informations dans le cadre de leurs fonctions.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Retour ou Destruction des Informations", content: `À la fin du contrat ou à la demande de la partie
divulgatrice, toutes les informations confidentielles, y compris les copies, doivent être retournées ou
détruites, selon les instructions de la partie divulgatrice.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Conséquences en cas de Violation", content: `En cas de violation de ces clauses de confidentialité, la partie
lésée aura le droit de demander des mesures correctives, y compris des dommages-intérêts, et de prendre
toutes les mesures judiciaires nécessaires pour protéger ses intérêts.`, paddingBottom: 100
                    }),
                    createText(`Cette clause vise à protéger les intérêts commerciaux et la propriété intellectuelle des parties et à favoriser
un environnement de con ance mutuelle pour la réalisation ef cace du contrat`, 200, 0),

                    // Article 7
                    createTitle({ text: "Article 7 - Clause de Non-Contournement", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createTitleContent({
                        indent: 720,
                        title: "Interdiction de Contournement", content: `L'Annonceur s'engage à ne pas contourner, directement ou
indirectement, le Loueur pour négocier ou conclure des contrats relatifs à la location des panneaux
publicitaires ou à des services similaires avec les propriétaires des sites des panneaux ou toute autre partie
associée, sans le consentement écrit préalable du Loueur. Cette interdiction s'applique pendant toute la
durée du contrat et pour une période de trois (3) années suivant sa résiliation ou son expiration.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Protection des Relations Commerciales", content: `La clause de non-contournement est conçue pour
protéger les relations commerciales et les accords exclusifs établis par le Loueur avec les propriétaires des
sites et autres parties. L'Annonceur reconnaît que le non-respect de cette clause pourrait causer un
préjudice significatif au Loueur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification Obligatoire", content: `Si l'Annonceur est approché par un tiers en relation avec les services
couverts par ce contrat, l'Annonceur doit en informer le Loueur et diriger ledit tiers vers le Loueur pour toute
négociation ou discussion.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Conséquences en cas de Violation", content: `En cas de violation de cette clause de non-contournement, le
Loueur aura le droit de prendre des mesures correctives, y compris de réclamer des dommages-intérêts et
d'engager des procédures judiciaires pour protéger ses intérêts commerciaux.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Reconnaissance de la Valeur Commerciale", content: `En acceptant les termes de cette clause,
l'Annonceur reconnaît la valeur commerciale des relations et des accords établis par le Loueur et s'engage à respecter la nature exclusive de ces relations dans le cadre de ce contrat. Cette clause vise à maintenir
l'intégrité des relations commerciales et à prévenir toute tentative de contournement qui pourrait nuire aux
intérêts commerciaux du Loueur.`, paddingBottom: 100
                    }),

                    // Article 8
                    createTitle({ text: "Article 8 - Force Majeure", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createTitleContent({
                        indent: 720,
                        title: "Définition de la Force Majeure", content: `Une force majeure est un événement ou une série d'événements
imprévisibles et irrésistibles, tels que des catastrophes naturelles (tremblements de terre, inondations,
ouragans), des conflits armés, des grèves nationales, des épidémies, des actes de terrorisme, ou des
changements significatifs de la réglementation, qui rendent impossible l'exécution normale des obligations
contractuelles par l'une des parties.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification de la Force Majeure", content: `La partie affectée par un événement de force majeure doit
informer l'autre partie par écrit dans un délai raisonnable, en général dans les dix (10) jours suivant la
survenue ou la connaissance de l’événement. Cette notification doit décrire la nature de l'événement de
force majeure, ainsi que son impact estimé sur les obligations de la partie affectée.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Suspension des Obligations", content: `Si l'une des parties est empêchée de remplir ses obligations
contractuelles en raison d'un événement de force majeure, ses obligations seront suspendues pendant la
durée de cet événement, sans qu'elle ne soit tenue responsable pour ce retard ou cette non-exécution. La
partie affectée doit faire tous les efforts raisonnables pour limiter les conséquences de l'événement de force
majeure et reprendre l'exécution complète de ses obligations dès que possible.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Renégociation ou Résiliation du Contrat", content: `Si l'événement de force majeure persiste au-delà d'une
période de trente (30) jours, les parties devront renégocier de bonne foi les termes du contrat pour s'adapter
à la nouvelle situation. Si l'événement de force majeure rend impossible l'exécution du contrat sur une
période prolongée, l'une des parties peut choisir de résilier le contrat sans pénalité.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Exclusions", content: `Les problèmes financiers ou les changements dans les conditions du marché ne sont
pas considérés comme des cas de force majeure.`, paddingBottom: 100
                    }),
                    createText(`La présente clause vise à fournir un cadre clair pour la gestion des circonstances imprévues qui
échappent au contrôle des parties et à préserver l'équité dans l'exécution du contrat.`),

                    // Article 9
                    createTitle({ text: "Article 9 - Modification du Contrat", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createTitleContent({
                        indent: 720,
                        title: "Procédure de Modification", content: `Toute modification, ajout ou suppression de clauses du présent
contrat doit être réalisée par écrit. Les modifications doivent être clairement formulées et convenues
mutuellement par les deux parties. Une modification n'est considérée comme valide et exécutoire que si elle
est formalisée dans un document signé par les représentants dûment autorisés des deux parties.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Forme Écrite Exigée", content: `Les modifications verbales ou informelles, y compris celles communiquées
par téléphone, courriel ou tout autre moyen de communication électronique, ne sont pas reconnues comme
valides aux fins de modification du présent contrat. Seules les modifications documentées par écrit et portant
les signatures des deux parties sont considérées comme légalement contraignantes.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Consentement Mutuel", content: `Les modifications apportées au contrat ne peuvent être mises en œuvre
sans le consentement explicite et mutuel des deux parties. Chaque partie doit avoir l'opportunité d'examiner
et de discuter de toute proposition de modification avant de donner son accord.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Non-Affectation des Obligations Préexistantes", content: `Toute modification apportée au contrat
n'affectera pas les droits et obligations nés sous le régime du contrat avant la modification, sauf si cela est
expressément convenu dans l'accord de modification.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification et Enregistrement des Modifications", content: `Une fois signée, une copie de la modification
doit être fournie à chaque partie pour être conservée avec le contrat original. Il est recommandé d'enregistrer
ou de notifier les modifications conformément aux exigences légales ou réglementaires applicables.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Date d'Entrée en Vigueur", content: `Les modifications entrent en vigueur à la date spécifiée dans l'accord
de modification, ou, si aucune date n'est spécifiée, à la date de la dernière signature apposée sur l'accord de
modification.`, paddingBottom: 100
                    }),
                    createText(`La présente clause garantit que toutes les modifications du contrat sont effectuées de manière
transparente, équitable et juridiquement valide, en préservant les intérêts et les attentes des deux parties.`),

                    // Article 10
                    createTitle({ text: "Article 10 - Résiliation", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Conditions de Résiliation Anticipée", content: `Chacune des parties a le droit de résilier ce contrat avant
son terme dans les cas suivants :`, paddingBottom: 0
                    }),
                    createText(`• Violation substantielle des termes du contrat par l'autre partie, non rectifiée dans un délai de dix
(10) jours après notification écrite de cette violation.`, 0, 820),
                    createText(`• Insolvabilité, faillite ou mise en liquidation de l'autre partie.`, 0, 820),
                    createText(`• Changement significatif des circonstances rendant l'exécution du contrat impossible ou
excessivement onéreuse.`, 100, 820),

                    createTitleContent({
                        indent: 720,
                        title: "Notification de Résiliation", content: `Toute intention de résilier le contrat doit être communiquée par écrit à
l'autre partie, en spécifiant clairement les raisons de la résiliation.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Effets de la Résiliation", content: `À la résiliation du contrat, toutes les obligations des parties prennent fin,
sauf celles qui, par leur nature, devraient survivre à la résiliation (comme les obligations de confidentialité ou
de non-contournement). L'Annonceur devra régler toutes les sommes dues jusqu'à la date de résiliation
effective.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Restitution des Propriétés", content: `À la résiliation du contrat, l'Annonceur doit cesser immédiatement
d'utiliser les panneaux publicitaires et permettre au Loueur de reprendre possession de ceux-ci. Toute
propriété appartenant à l'une des parties et se trouvant en possession de l'autre partie doit être restituée
dans les dix (10) jours suivant la date de résiliation.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Pénalités de Résiliation", content: `En cas de résiliation pour faute de l'Annonceur, des pénalités peuvent
être appliquées, telles que définies dans les termes du contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Clause de Non-Contestation", content: `Les parties s'engagent à ne pas contester la validité de la résiliation
lorsqu'elle est effectuée conformément aux termes de cette clause.`, paddingBottom: 100
                    }),
                    createText(`La présente clause de résiliation permet une cessation ordonnée et équitable du contrat en cas de
nécessité, en protégeant les droits et intérêts de chaque partie.`),

                    // Article 11
                    createTitle({ text: "Article 11 - Responsabilité et Assurance", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Responsabilité Générale", content: `Chaque partie, ainsi que leurs sous-traitants, assument l'entière
responsabilité des dommages corporels, matériels ou de toute autre nature causés à des tiers dans le cadre
de l'exécution du présent contrat. Cette responsabilité est régie par le droit commun applicable.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Assurance Responsabilité Civile", content: `Les parties déclarent chacune détenir une police d'assurance
responsabilité civile appropriée, couvrant les risques liés à leurs activités et responsabilités respectives dans
le cadre de ce contrat. Les polices d'assurance doivent couvrir suffisamment tous les dommages potentiels
et les responsabilités qui pourraient découler de l'exécution ou de la non-exécution des obligations
contractuelles.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Responsabilité des Sous-Traitants", content: `Les parties s'engagent à ce que tous leurs sous-traitants
soient également couverts par une assurance responsabilité civile adéquate. En cas de dommage causé par
les sous-traitants de l'une des parties, cette partie sera tenue responsable et devra assumer les
conséquences de la responsabilité civile de ses sous-traitants.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Preuve d'Assurance", content: `Sur demande, chaque partie doit être en mesure de fournir une preuve de sa
couverture d'assurance à l'autre partie. Les parties s'engagent à maintenir leurs polices d'assurance en
vigueur tout au long de la durée du contrat.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Gestion des Sinistres", content: `En cas de sinistre impliquant une responsabilité couverte par les polices
d'assurance, la partie concernée s'engage à prendre en charge la gestion et le suivi du sinistre en
coordination avec son assureur.`, paddingBottom: 100
                    }),
                    createText(`La présente clause assure que les parties disposent de protections adéquates contre les risques liés à l'exécution du contrat et démontre leur engagement à gérer de manière responsable toute responsabilité potentielle.`),

                    // Article 12
                    createTitle({ text: "Article 12 – Intégralité du contrat", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Le présent contrat y compris ses annexes exprime l’intégralité des obligations des parties et prévaut
sur tous les engagements écrits ou verbaux préalables entre les parties.`),

                    // Article 13
                    createTitle({ text: "Article 13 - Droit Applicable et Résolution des Conflits", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Droit Applicable", content: `Le présent contrat est régi et interprété conformément aux lois du ${contract.company.country}. Toutes les activités entreprises dans le cadre de ce contrat seront conformes à la législation en
vigueur au ${contract.company.country}. Les parties s'engagent à respecter toutes les lois et réglementations locales applicables à
l'exécution du contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Résolution Amiable des Conflits", content: `En cas de désaccord ou de litige découlant de ou lié à ce
contrat, les parties s'engagent d'abord à tenter une résolution à l’amiable. Cette démarche implique des
discussions de bonne foi entre les représentants des parties, dans un délai de vingts (20) jours suivant la
notification écrite du désaccord ou du litige.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Médiation", content: `Si la résolution amiable échoue, les parties peuvent convenir de soumettre le différend à
une médiation avant de prendre toute mesure judiciaire. La médiation sera menée par un médiateur neutre
et qualifié, choisi d'un commun accord par les parties.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Arbitrage", content: `En cas d'échec de la médiation, ou si les parties choisissent de ne pas opter pour la
médiation, tout litige sera résolu par arbitrage. L'arbitrage sera mené conformément aux règles d'arbitrage
de la Chambre de Commerce Internationale ou d'un autre organisme d'arbitrage agréé, avec un siège
d'arbitrage situé à ${contract.company.city}.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Exécution des Décisions", content: `Les décisions issues de la médiation ou de l'arbitrage seront finales et
contraignantes pour les parties et pourront être exécutées dans toute juridiction compétente.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Frais de Résolution des Conflits", content: `Les frais engendrés par la médiation ou l'arbitrage, y compris
les honoraires des médiateurs ou arbitres, seront partagés équitablement entre les parties, sauf décision
contraire du médiateur ou de l’arbitre.`, paddingBottom: 100
                    }),
                    createText(`La présente clause vise à assurer une résolution efficace et équitable des différends, minimisant le
besoin de recourir à des procédures judiciaires longues et coûteuses.`),

                    // Article 14
                    createTitle({ text: "Article 14 - Notifications et Communications", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Moyens de Communication Formels", content: `Toutes les notifications, demandes, approbations et autres
communications requises ou permises par ce contrat doivent être effectuées par écrit. Les communications
of cielles doivent être envoyées par courrier recommandé, courrier électronique avec accusé de réception,
ou tout autre moyen permettant de prouver leur réception.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Adresses de Notification", content: `Les notifications a l’annonceur doivent être envoyées à l'adresse
suivante : ${contract.client.email} ou par téléphone au ${contract.client.phone}, ou à toute autre adresse que le Bailleur
pourrait désigner par écrit ultérieurement. Les notifications à La Régie Publicitaire doivent être envoyées à
l'adresse suivante : ${contract.company.email} ou au ${contract.company.phone}, ou à toute autre adresse que La Régie
Publicitaire pourrait désigner par écrit ultérieurement.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Délais de Réception", content: `Une notification est considérée comme reçue :`, paddingBottom: 0
                    }),
                    createText(`• le jour de sa réception si elle est livrée en main propre ;`, 0, 820),
                    createText(`• le jour de l'envoi si elle est transmise par courrier électronique avec accusé de réception ;`, 0, 820),
                    createText(`• ou dans les dix (10) jours ouvrables après son envoi si elle est expédiée par courrier
recommandé.`, 100, 820),

                    createTitleContent({
                        indent: 720,
                        title: "Changements d'Adresse", content: `Si l'une des parties change son adresse de communication, elle doit en
informer l'autre partie par écrit dans un délai de trente (30) jours.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Langue de Communication", content: `Toutes les communications et notifications liées à ce contrat doivent
être rédigées en français, qui est la langue officielle du contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Preuve de l'Envoi", content: `Pour les communications effectuées par courrier électronique, l'accusé de
réception fera foi de la réception. Pour les envois par courrier, l'accusé de réception postal ou le reçu de
livraison servira de preuve de réception.`, paddingBottom: 100
                    }),
                    createText(`La présente clause garantit que toutes les communications importantes liées au contrat sont réalisées de
manière formelle, claire et traçable, évitant ainsi les malentendus et fournissant une trace documentée en
cas de besoin.`, 200, 0),

                    // Article 15
                    createTitle({ text: "Article 15 - Signatures", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Ce contrat est signé en deux exemplaires originaux, chacun desquels est considéré comme
authentique. Chaque partie reconnaît avoir reçu un exemplaire.`),
                    createText(`En signant ci-dessous, les représentants de chacune des parties déclarent qu'ils sont dûment
autorisés à engager respectivement leur entreprise. Ils reconnaissent également avoir lu, compris et accepté
tous les termes et conditions énoncés dans ce contrat.`, 600),


                    // Signatures
                    new Table({
                        width: { size: 100, type: "pct" },
                        rows: [
                            new TableRow({
                                children: [
                                    cell([
                                        createTitle({
                                            text: "Pour le Loueur",
                                            paddingTop: 400,
                                            paddingBottom: 100,
                                            size: 11,
                                            bold: true,
                                        }),
                                        createTitleContent({
                                            title: "Nom",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Titre",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Signature",
                                            content: "",
                                            paddingBottom: 100,
                                        }),
                                    ]),

                                    cell([
                                        createTitle({
                                            text: "Pour l’Annonceur",
                                            paddingTop: 400,
                                            paddingBottom: 100,
                                            size: 11,
                                            underline: true,
                                            bold: true,
                                        }),
                                        createTitleContent({
                                            title: "Nom",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Titre",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Signature",
                                            content: "",
                                            paddingBottom: 100,
                                        }),
                                    ]),
                                ],
                            }),
                        ],
                    })
                ],
            },
        ],

    });

    return await Packer.toBlob(doc);
}


export async function generateLessorContractDocument(contract: ContractLessorType): Promise<Blob> {
    const doc = new Document({
        sections: [
            {
                properties: {},
                footers: {
                    default: createFooter(contract.filename)
                },

                children: [
                    createHeader(contract.company.country, 'LESSOR'),

                    createTitle({ text: "D'une part,", bold: true, size: 12 }),
                    createTitleContent({ title: 'Nom', content: contract.lessor.company }),
                    createTitleContent({ title: 'Type', content: contract.lessor.legalForm || "xxxxxxxxxxxxx" }),
                    createTitleContent({ title: 'Capital', content: ` ${Number(contract.lessor.capital) > 0 ? formatNumber(contract.lessor.capital) : 'xxxxxxxxxxxxx'} ${Number(contract.lessor.capital) > 0 ? contract.company.currency : ''}` }),
                    createTitleContent({ title: 'Registre du Commerce et du Crédit Mobilier (RCCM)', content: contract.lessor.rccm || "xxxxxxxxxxxxx" }),
                    createTitleContent({ title: 'Numéro fiscal', content: contract.lessor.nif || "xxxxxxxxxxxxx" }),
                    createTitleContent({ title: 'Siège social', content: contract.lessor.address }),
                    lessorContractOwner(`${contract.lessor.representativeName}`, `${contract.lessor.representativeJob || "xxxxxxxxxxxxx"}`),

                    createTitle({ text: "Et d'autre part,", bold: true, size: 12 }),
                    createTitleContent({ title: 'Nom', content: contract.company.name }),
                    createTitleContent({ title: 'Type', content: contract.company.legalForm }),
                    createTitleContent({ title: 'Capital', content: `${formatNumber(contract.company.capital)} ${contract.company.currency}` }),
                    createTitleContent({ title: 'Siège social', content: contract.company.address }),
                    createTitleContent({ title: 'RCCM', content: contract.company.rccm }),
                    createTitleContent({ title: 'NIU', content: contract.company.niu ?? "" }),
                    companyContractOwner(`${contract.company.representativeName}`, contract.lessor.representativeJob || "",),
                    createTitle({ text: "D'autre part.", bold: false, paddingTop: 0 }),

                    createTitle({ text: "Il a été convenu et arrêté ce qui suit :", bold: true, paddingTop: 0, paddingBottom: 0 }),
                    createText(`Les parties déclarent et garantissent posséder la capacité juridique nécessaire pour contracter et s'engager au titre du présent contrat. Elles reconnaissent que le contrat a été négocié de manière équitable et que chacune a eu la possibilité de consulter un conseiller juridique.`),
                    createText(`Le présent contrat est régi par les lois en vigueur du ${contract.company.country} et est sujet à modification uniquement par accord écrit et signé par les deux parties.`),
                    createText("Ce contrat prend effet à la date de sa signature par les deux parties et demeurera en vigueur jusqu'à l'achèvement de toutes les obligations contractuelles, sauf résiliation anticipée conforme aux dispositions établies dans les articles suivants."),
                    new Paragraph({ children: [new PageBreak()] }),

                    // Article 1
                    createTitle({ text: "Article 1 - Objet", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Le présent contrat a pour objet la location par le Bailleur à La Régie Publicitaire de la façade de l'immeuble situé au ${contract.lessor.address}, exclusivement pour l'installation et l'exploitation d'un panneau publicitaire.`),

                    createTitleContent({
                        indent: 720,
                        title: "Description de l'Emplacement", content: `La façade de l'immeuble est décrite comme suit (détailler l'emplacement, dimensions, visibilité).`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Installation du Panneau", content: `Le panneau sera utilisé exclusivement pour l'affichage de publicités des clients de la régie publicitaire. Le Bailleur ne sera pas impliqué dans le choix ou l'approbation des publicités affichées.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Conformité et Approbations", content: `La Régie Publicitaire s'engage à obtenir toutes les approbations nécessaires des autorités compétentes pour l'installation et l'exploitation du panneau publicitaire. La Régie Publicitaire garantit que l'installation sera conforme aux normes et règlements locaux, y compris les normes de sécurité et environnementales.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Accès à l'Emplacement", content: `Le Bailleur fournira à La Régie Publicitaire un accès raisonnable à l'emplacement pour l'installation, l'entretien, et, le cas échéant, le démontage du panneau.`, paddingBottom: 100
                    }),


                    // Article 2
                    createTitle({ text: "Article 2 : Durée de la Location", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`La location est consentie pour une durée déterminée, avec des dispositions spécifiques pour le renouvellement et la résiliation :`),
                    createTitleContent({
                        indent: 720,
                        title: "Durée Initiale", content: `La durée initiale du contrat est de (${getMonthsAndDaysDifference(contract.lessor.startLocation, contract.lessor.endLocation)}), commençant le ${formatDateToDashModel(contract.lessor.startLocation)} et se terminant le ${formatDateToDashModel(contract.lessor.endLocation)}. Cette période est invariable, sauf accord écrit contraire des deux parties.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Renouvellement Automatique", content: `À l'expiration de la durée initiale, ce contrat sera automatiquement renouvelé pour des périodes successives d'un an, sauf si l'une des parties notifie à l'autre son intention de ne pas renouveler le contrat. Cette notification doit être faite par écrit au moins trois mois avant la fin de la période en cours.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Modification de la Durée", content: `Toute modification de la durée de la location après la période initiale doit être convenue par écrit par les deux parties. Cette modification peut inclure une extension ou une réduction de la durée de location, selon les besoins des parties.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Conditions de Résiliation Anticipée", content: `Chaque partie a le droit de résilier ce contrat avant la fin de la période de location en cours, sous réserve des conditions définies à l'Article 12 du présent contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Conséquences de la Fin de la Location", content: `À l'expiration ou à la résiliation du contrat, La Régie Publicitaire s'engage à retirer le panneau publicitaire et à remettre la façade dans son état initial, conformément aux termes de l'Article 12.`, paddingBottom: 100
                    }),


                    // Article 3
                    createTitle({ text: "Article 3 : Obligations du Bailleur", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Dans le cadre de ce contrat de location pour l'installation d'un dispositif publicitaire, le Bailleur s'engage à respecter les obligations suivantes :`),
                    createTitleContent({
                        indent: 720,
                        title: "Mise à Disposition de l’Emplacement", content: `Le Bailleur mettra à disposition de La Régie Publicitaire l’emplacement désigné pour l’installation du dispositif publicitaire, libre de tout droit d’un tiers. L'emplacement sera dégagé et prêt pour l'installation à la date convenue.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Accès pour Installation et Entretien", content: `Le Bailleur s'engage à donner au personnel de La Régie Publicitaire et de son ou ses sous-traitant(s) un libre-accès aux emplacements nécessaires pour la réalisation des travaux de mise en place, d’entretien et de modification du dispositif publicitaire.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Gestion de la Végétation", content: `La Régie Publicitaire sera autorisée à procéder à la suppression ou à l’élagage de la végétation pouvant masquer les messages publicitaires, en respectant les contraintes environnementales en vigueur. Toute action de ce type nécessite un accord express et préalable du Bailleur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Accès au Réseau Électrique", content: `Lorsqu’il y a lieu, le Bailleur accordera à la Régie Publicitaire l’accès au réseau électrique pour permettre l’installation de l’éclairage du dispositif publicitaire. Les frais de consommation électrique générés par le dispositif seront entièrement à la charge de la Régie Publicitaire et ne pourront en aucun cas être supportés par le Bailleur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Exclusivité de Location", content: `Pendant la durée de ce contrat, le Bailleur s'engage à ne pas louer d'autres espaces sur le même bâtiment à une société concurrente de la Régie Publicitaire pour des fins d’affichage publicitaire.`, paddingBottom: 100
                    }),


                    // Article 4
                    createTitle({ text: "Article 4 : Obligations de la Régie Publicitaire", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Dans le cadre de ce contrat de location pour l'utilisation de la façade pour affichage publicitaire, La Régie Publicitaire s'engage à respecter les obligations suivantes :`),

                    createTitleContent({
                        indent: 720,
                        title: "Paiement de la Redevance", content: `En contrepartie de la location des emplacements, la Régie Publicitaire paiera la redevance due conformément aux dispositions de l'Article 5 du présent contrat. Les paiements seront effectués aux échéances convenues et selon les modalités spécifiées.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Démarches Administratives", content: `La Régie Publicitaire prendra en charge toutes les démarches et obtiendra les autorisations administratives nécessaires à la réalisation de ses projets d’affichage. Elle se conformera à la réglementation en vigueur en matière de publicité et d’affichage et s'acquittera de tous les droits, taxes, redevances et autres frais y afférents. La Régie Publicitaire garantira le Bailleur contre toute conséquence résultant du non-respect de ces obligations.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Organisation et Responsabilité des Travaux", content: `La Régie Publicitaire mettra en place toute l’organisation interne nécessaire et déploiera, sous sa seule et entière responsabilité, tous les moyens adaptés à la bonne exécution des travaux d’installation et de maintenance du dispositif. Elle s’engage à respecter et à faire respecter les normes de sécurité, particulièrement en ce qui concerne les travaux sur un immeuble de plus de cinq (5) mètres de haut.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Usage Exclusif du Dispositif", content: `La Régie Publicitaire utilisera le dispositif exclusivement à des fins d’affichage publicitaire, à l’exclusion de tout autre usage. Elle veillera à ce que le contenu diffusé soit conforme aux engagements pris dans l'Article 7 du présent contrat.`, paddingBottom: 100
                    }),


                    // Article 5
                    createTitle({ text: "Article 5 : Loyer", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Les modalités de paiement du loyer sont définies comme suit pour assurer une compréhension claire des obligations financières de La Régie Publicitaire :`),

                    // ici
                    createTitleContent({
                        indent: 720,
                        title: "Montant du Loyer", content: `Le loyer mensuel est fixé à ${contract.lessor.locationPrice} lorsque le panneau publicitaire est occupé par une publicité. Dans le cas où le panneau n'est pas loué, c'est-à-dire sans publicité, le loyer mensuel sera de ${contract.lessor.nonlocationPrice}.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Conditions de Paiement", content: `Le loyer est payable mensuellement à terme échu, au plus tard le 5ème jour du mois suivant. Le paiement doit être effectué par virement bancaire, chèque ou espèces au compte bancaire désigné par le Bailleur contre délivrance d’une quittance.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Révision du Loyer", content: `Le loyer peut être révisé annuellement par le Bailleur en fonction des conditions du marché et des coûts d'entretien de la façade. Toute révision du loyer sera communiquée à La Régie Publicitaire au moins deux mois avant la date d'entrée en vigueur.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Exonération de Loyer", content: `En cas d'événements imprévus tels que des catastrophes naturelles ou d'autres circonstances majeures qui empêcheraient l'utilisation de la façade pour l'affichage publicitaire, une exonération partielle ou totale du loyer pourra être négociée entre les parties.`, paddingBottom: 100
                    }),


                    // Article 6
                    createTitle({ text: "Article 6 : Entretien et Modification de la Structure", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Cette section définit les responsabilités de La Régie Publicitaire concernant l'entretien et les modifications de la structure du panneau publicitaire :`),
                    createTitleContent({
                        indent: 720,
                        title: "Entretien de la Structure", content: `La Régie Publicitaire est responsable de l'entretien régulier de la structure du panneau publicitaire. Cela inclut, mais ne se limite pas à, l'entretien structurel, l'entretien esthétique (peinture, nettoyage), et l'entretien des composants électriques et électroniques, le cas échéant.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Inspections Régulières", content: `Des inspections régulières de la structure doivent être effectuées par La Régie Publicitaire au moins une fois tous les six mois pour garantir la sécurité et le bon fonctionnement du panneau. Un rapport d'inspection doit être fourni au Bailleur dans les 15 jours suivant chaque inspection.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Conformité aux Normes", content: `La Régie Publicitaire s'assure que la structure est conforme à toutes les normes de sécurité et environnementales en vigueur. Cela inclut le respect des réglementations locales en matière de sécurité, de bruit, d'émission lumineuse, et d'impact environnemental.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Dommages à la Façade", content: `En cas de dommages causés à la façade de l'immeuble du fait de l'installation, de l'entretien, ou de la modification de la structure, La Régie Publicitaire est tenu de réparer ces dommages à ses frais dans un délai raisonnable.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Retrait de la Structure", content: `À la fin du contrat ou en cas de résiliation, La Régie Publicitaire est responsable du démontage et du retrait de la structure du panneau publicitaire. La façade doit être remise dans son état initial, à la charge de La Régie Publicitaire.`, paddingBottom: 100
                    }),


                    // Article 7
                    createTitle({ text: "Article 7 : Engagement sur le Contenu Diffusé", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Dans le cadre de ce contrat de location pour l'utilisation de la façade pour affichage publicitaire, La Régie Publicitaire s'engage à respecter les conditions suivantes concernant le contenu diffusé :`),
                    createTitleContent({
                        indent: 720,
                        title: "Respect des Bonnes Mœurs", content: `La Régie Publicitaire s'engage à ne diffuser que des contenus respectant les bonnes mœurs. Cela exclut tout contenu jugé offensant, obLa Régie Publicitaire s'engage à ne diffuser que des contenus respectant les bonnes mœurs. Cela exclut tout contenu jugé offensant, obscène, diffamatoire, ou inapproprié selon les normes sociales et culturelles en vigueur.scène, diffamatoire, ou inapproprié selon les normes sociales et culturelles en vigueur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Exclusion de Contenu Politique et Religieux", content: `La Régie Publicitaire s'engage à ne pas utiliser le panneau publicitaire pour diffuser des messages à caractère politique ou religieux. Cela inclut, mais n'est pas limité à, la propagande politique, les messages partisans, et le prosélytisme religieux.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Préjudice au Bailleur", content: `La Régie Publicitaire s'assure que le contenu diffusé ne cause aucun préjudice, direct ou indirect, au Bailleur, tant en termes d'image que de concurrence commerciale. Ceci comprend l'interdiction de diffuser du contenu faisant la promotion de produits ou services en concurrence directe avec ceux offerts par le Bailleur.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Responsabilité du Contenu", content: `La Régie Publicitaire est pleinement responsable du contenu diffusé sur le panneau publicitaire. En cas de diffusion de contenu ne respectant pas les termes de cet article, le Bailleur se réserve le droit de demander le retrait immédiat de ce contenu et, si nécessaire, d'engager des actions en justice pour dommages et intérêts.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Vérification du Contenu", content: `a Régie Publicitaire s'engage à mettre en place des mécanismes de vérification rigoureux pour s'assurer de la conformité du contenu avec les termes de cet article avant sa diffusion.`, paddingBottom: 100
                    }),


                    // Article 8
                    createTitle({ text: "Article 8 : Clause de Confidentialité", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Cette clause précise les obligations des parties en matière de confidentialité et la gestion des informations sensibles :`),

                    createTitleContent({
                        indent: 720,
                        title: "Portée de la Confidentialité", content: `Le Bailleur s'engage à ne pas divulguer, communiquer ou utiliser à des fins autres que celles du présent contrat, toute information concernant les termes du contrat, y compris, mais sans s'y limiter, les détails financiers, les méthodes et technologies utilisées par La Régie Publicitaire, ainsi que toute information commerciale sensible.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Durée de l'Obligation de Confidentialité", content: `L'obligation de confidentialité demeure en vigueur pendant toute la durée du contrat et se prolonge pour une période de deux (2) ans après la fin ou la résiliation du contrat, quelles qu'en soient les raisons.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Exclusions", content: `Les informations qui sont déjà du domaine public ou qui deviennent publiques sans faute du Bailleur ne sont pas couvertes par cette clause de confidentialité.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification en Cas de Violation", content: `En cas de soupçon de violation de cette clause de confidentialité, le Bailleur doit en informer immédiatement La Régie Publicitaire, et les deux parties collaboreront pour limiter l'impact de cette violation.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Sanctions en Cas de Violation", content: `La violation de la clause de confidentialité peut entraîner des réparations financières, des sanctions contractuelles, et/ou des poursuites judiciaires, en fonction de la gravité et des conséquences de la violation.`, paddingBottom: 100
                    }),


                    // Article 9
                    createTitle({ text: "Article 9 : Clause de Non-Contournement", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Cette clause vise à protéger les relations commerciales établies par La Régie Publicitaire et à prévenir les actions de contournement direct ou indirect par le Bailleur :`),
                    createTitleContent({
                        indent: 720,
                        title: "Engagement de Non-Contournement", content: `Le Bailleur s'engage à ne pas entrer en contact direct ou indirect, ni engager de négociations ou de transactions avec les clients actuels ou potentiels de La Régie Publicitaire, identifiés pendant la durée du contrat, pour des services similaires ou concurrents à ceux offerts par La Régie Publicitaire.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Durée de l'Engagement", content: `Cet engagement de non-contournement reste valide pendant toute la durée du contrat et se prolonge pour une période de deux (2) ans après la fin ou la résiliation du contrat, quelle qu'en soit la raison.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Définition des Clients Protégés", content: `Sont considérés comme clients protégés tous les clients avec lesquels La Régie Publicitaire a eu des relations commerciales ou des négociations pendant la durée du contrat, ainsi que ceux avec qui il est en pourparlers au moment de la fin ou de la résiliation du contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Sanctions en Cas de Violation", content: `En cas de violation de cette clause, le Bailleur sera tenu responsable des pertes commerciales subies par La Régie Publicitaire et pourra faire l'objet de poursuites judiciaires ou de demandes de réparation financière.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification Obligatoire", content: `Si le Bailleur est approché par un client protégé pour des services similaires, il doit en informer La Régie Publicitaire et refuser toute négociation ou transaction en respect de cette clause.`, paddingBottom: 100
                    }),


                    // Article 10
                    createTitle({ text: "Article 10 - Force Majeure", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Définition de la Force Majeure", content: `Une force majeure est un événement ou une série d'événements imprévisibles et irrésistibles, tels que des catastrophes naturelles (tremblements de terre, inondations, ouragans), des conflits armés, des grèves nationales, des épidémies, des actes de terrorisme, ou des changements significatifs de la réglementation, qui rendent impossible l'exécution normale des obligations contractuelles par l'une des parties.`, paddingBottom: 0
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification de la Force Majeure", content: `La partie affectée par un événement de force majeure doit informer l'autre partie par écrit dans un délai raisonnable, en général dans les dix (10) jours suivant la survenue ou la connaissance de l’événement. Cette notification doit décrire la nature de l'événement de force majeure, ainsi que son impact estimé sur les obligations de la partie affectée.`, paddingBottom: 0
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Suspension des Obligations", content: `Si l'une des parties est empêchée de remplir ses obligations contractuelles en raison d'un événement de force majeure, ses obligations seront suspendues pendant la durée de cet événement, sans qu'elle ne soit tenue responsable pour ce retard ou cette non-exécution. La partie affectée doit faire tous les efforts raisonnables pour limiter les conséquences de l'événement de force majeure et reprendre l'exécution complète de ses obligations dès que possible.`, paddingBottom: 0
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Renégociation ou Résiliation du Contrat", content: `Si l'événement de force majeure persiste au-delà d'une période de trente (30) jours, les parties devront renégocier de bonne foi les termes du contrat pour s'adapter à la nouvelle situation. Si l'événement de force majeure rend impossible l'exécution du contrat sur une période prolongée, l'une des parties peut choisir de résilier le contrat sans pénalité.`, paddingBottom: 0
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Exclusions", content: `Les problèmes financiers ou les changements dans les conditions du marché ne sont pas considérés comme des cas de force majeure.`, paddingBottom: 0
                    }),
                    createText(`La présente clause vise à fournir un cadre clair pour la gestion des circonstances imprévues qui échappent au contrôle des parties et à préserver l'équité dans l'exécution du contrat.`),

                    // Article 11
                    createTitle({ text: "Article 11 - Modification du Contrat", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Procédure de Modification", content: `Toute modification, ajout ou suppression de clauses du présent contrat doit être réalisée par écrit. Les modifications doivent être clairement formulées et convenues mutuellement par les deux parties. Une modification n'est considérée comme valide et exécutoire que si elle est formalisée dans un document signé par les représentants dûment autorisés des deux parties.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Forme Écrite Exigée", content: `Les modifications verbales ou informelles, y compris celles communiquées par téléphone, courriel ou tout autre moyen de communication électronique, ne sont pas reconnues comme valides aux fins de modification du présent contrat. Seules les modifications documentées par écrit et portant les signatures des deux parties sont considérées comme légalement contraignantes.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Consentement Mutuel", content: `Les modifications apportées au contrat ne peuvent être mises en œuvre sans le consentement explicite et mutuel des deux parties. Chaque partie doit avoir l'opportunité d'examiner et de discuter de toute proposition de modification avant de donner son accord.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Non-Affectation des Obligations Préexistantes", content: `Toute modification apportée au contrat n'affectera pas les droits et obligations nés sous le régime du contrat avant la modification, sauf si cela est expressément convenu dans l'accord de modification.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Notification et Enregistrement des Modifications", content: `Une fois signée, une copie de la modification doit être fournie à chaque partie pour être conservée avec le contrat original. Il est recommandé d'enregistrer ou de notifier les modifications conformément aux exigences légales ou réglementaires applicables.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Date d'Entrée en Vigueur", content: `Les modifications entrent en vigueur à la date spécifiée dans l'accord de modification, ou, si aucune date n'est spécifiée, à la date de la dernière signature apposée sur l'accord de modification.`, paddingBottom: 100
                    }),

                    createText(`La présente clause garantit que toutes les modifications du contrat sont effectuées de manière transparente, équitable et juridiquement valide, en préservant les intérêts et les attentes des deux parties.`),

                    // Article 12
                    createTitle({ text: "Article 12 : Résiliation", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Conditions de Résiliation Anticipée :", content: ``, paddingBottom: 100
                    }),
                    createText(`Chacune des parties a le droit de résilier ce contrat avant son terme dans les cas suivants :`, 0, 0),
                    createText(`• Violation substantielle des termes du contrat par l'autre partie, non rectifiée dans un délai de dix (10) jours après notification écrite de cette violation.`, 0, 820),
                    createText(`• Insolvabilité, faillite ou mise en liquidation de l'autre partie.`, 0, 820),
                    createText(`• Changement significatif des circonstances rendant l'exécution du contrat impossible ou excessivement onéreuse tel que l’absence prolongé d’annonceur.`, 0, 820),

                    createTitleContent({
                        indent: 720,
                        title: "Notification de Résiliation", content: `Toute intention de résilier le contrat doit être communiquée par écrit à l'autre partie, en spécifiant clairement les raisons de la résiliation.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Effets de la Résiliation", content: `À la résiliation du contrat, toutes les obligations des parties prennent fin, sauf celles qui, par leur nature, devraient survivre à la résiliation (comme les obligations de confidentialité ou de non-contournement). La Régie Publicitaire devra régler toutes les sommes dues jusqu'à la date de résiliation effective.`, paddingBottom: 100
                    }),

                    createTitleContent({
                        indent: 720,
                        title: "Restitution des Propriétés", content: `À la résiliation du contrat, La Régie Publicitaire doit cesser immédiatement l'utilisation de la façade pour l'affichage publicitaire, procéder au retrait du panneau publicitaire, et permettre au Bailleur de reprendre possession de sa façade dans son état initial. Toute propriété appartenant à l'une des parties et se trouvant en possession de l'autre partie doit être restituée dans les dix (10) jours suivant la date de résiliation.`, paddingBottom: 100
                    }),

                    // Article 13
                    createTitle({ text: "Article 13 - Responsabilité et Assurances", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createTitleContent({
                        indent: 720,
                        title: "Responsabilité Générale", content: `Chaque partie, ainsi que leurs sous-traitants, assument l'entière responsabilité des dommages corporels, matériels ou de toute autre nature causés à des tiers dans le cadre de l'exécution du présent contrat. Cette responsabilité est régie par le droit commun applicable.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Assurance Responsabilité Civile", content: `les parties déclarent chacune détenir une police d'assurance responsabilité civile appropriée, couvrant les risques liés à leurs activités et responsabilités respectives dans le cadre de ce contrat. Les polices d'assurance doivent couvrir suffisamment tous les dommages potentiels et les responsabilités qui pourraient découler de l'exécution ou de la non-exécution des obligations contractuelles.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Responsabilité des Sous-Traitants", content: `Les parties s'engagent à ce que tous leurs sous-traitants soient également couverts par une assurance responsabilité civile adéquate. En cas de dommage causé par les sous-traitants de l'une des parties, cette partie sera tenue responsable et devra assumer les conséquences de la responsabilité civile de ses sous-traitants.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Preuve d'Assurance", content: `Sur demande, chaque partie doit être en mesure de fournir une preuve de sa couverture d'assurance à l'autre partie. Les parties s'engagent à maintenir leurs polices d'assurance en vigueur tout au long de la durée du contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Gestion des Sinistres", content: `En cas de sinistre impliquant une responsabilité couverte par les polices d'assurance, la partie concernée s'engage à prendre en charge la gestion et le suivi du sinistre en coordination avec son assureur.`, paddingBottom: 100
                    }),

                    createText(`La présente clause assure que les parties disposent de protections adéquates contre les risques liés à l'exécution du contrat et démontre leur engagement à gérer de manière responsable toute responsabilité potentielle.`),

                    // Article 14
                    createTitle({ text: "Article 14 – Intégralité du contrat", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createText(`Le présent contrat y compris ses annexes exprime l’intégralité des obligations des parties et prévaut sur tous les engagements écrits ou verbaux préalables entre les parties.`, 200, 0),

                    // Article 15
                    createTitle({ text: "Article 15 - Droit Applicable et Résolution des Conflits", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createTitleContent({
                        indent: 720,
                        title: "Droit Applicable", content: `Le présent contrat est régi et interprété conformément aux lois de la République Congolaise. Toutes les activités entreprises dans le cadre de ce contrat seront conformes à la législation en vigueur au Congo. Les parties s'engagent à respecter toutes les lois et réglementations locales applicables à l'exécution du contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Résolution Amiable des Conflits", content: `En cas de désaccord ou de litige découlant de ou lié à ce contrat, les parties s'engagent d'abord à tenter une résolution à l’amiable. Cette démarche implique des discussions de bonne foi entre les représentants des parties, dans un délai de vingts (20) jours suivant la notification écrite du désaccord ou du litige.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Médiation", content: `Si la résolution amiable échoue, les parties peuvent convenir de soumettre le différend à une médiation avant de prendre toute mesure judiciaire. La médiation sera menée par un médiateur neutre et qualifié, choisi d'un commun accord par les parties.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Arbitrage", content: `En cas d'échec de la médiation, ou si les parties choisissent de ne pas opter pour la médiation, tout litige sera résolu par arbitrage. L'arbitrage sera mené conformément aux règles d'arbitrage de la Chambre de Commerce Internationale ou d'un autre organisme d'arbitrage agréé, avec un siège d'arbitrage situé à Brazzaville ou Pointe-Noire.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Exécution des Décisions", content: `Les décisions issues de la médiation ou de l'arbitrage seront finales et contraignantes pour les parties et pourront être exécutées dans toute juridiction compétente.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Frais de Résolution des Conflits", content: `Les frais engendrés par la médiation ou l'arbitrage, y compris les honoraires des médiateurs ou arbitres, seront partagés équitablement entre les parties, sauf décision contraire du médiateur ou de l’arbitre.`, paddingBottom: 100
                    }),
                    createText(`La présente clause vise à assurer une résolution efficace et équitable des différends, minimisant le besoin de recourir à des procédures judiciaires longues et coûteuses.`),

                    // Article 16
                    createTitle({ text: "Article 16 - Notifications et Communications", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createTitleContent({
                        indent: 720,
                        title: "Moyens de Communication Formels", content: `Toutes les notifications, demandes, approbations et autres communications requises ou permises par ce contrat doivent être effectuées par écrit. Les communications officielles doivent être envoyées par courrier recommandé, courrier électronique avec accusé de réception, ou tout autre moyen permettant de prouver leur réception.`, paddingBottom: 100
                    }),
                    // ici
                    createTitleContent({
                        indent: 720,
                        title: "Adresses de Notification", content: `Les notifications au Bailleur doivent être envoyées à l'adresse suivante : ${contract.lessor.email} ou par téléphone au ${contract.lessor.phone}, ou à toute autre adresse que le Bailleur pourrait désigner par écrit ultérieurement. Les notifications à La Régie Publicitaire doivent être envoyées à l'adresse suivante : ${contract.company.email} ou au ${contract.company.phone}, ou à toute autre adresse que La Régie Publicitaire pourrait désigner par écrit ultérieurement.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Délais de Réception", content: `Une notification est considérée comme reçue : `, paddingBottom: 100
                    }),
                    createText(`• le jour de sa réception si elle est livrée en main propre ;`, 0, 820),
                    createText(`• le jour de l'envoi si elle est transmise par courrier électronique avec accusé de réception ; `, 0, 820),
                    createText(`• ou dans les dix (10) jours ouvrables après son envoi si elle est expédiée par courrier recommandé.`, 0, 820),

                    createTitleContent({
                        indent: 720,
                        title: "Changements d'Adresse", content: `Si l'une des parties change son adresse de communication, elle doit en informer l'autre partie par écrit dans un délai de trente (30) jours.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Langue de Communication", content: `Toutes les communications et notifications liées à ce contrat doivent être rédigées en français, qui est la langue officielle du contrat.`, paddingBottom: 100
                    }),
                    createTitleContent({
                        indent: 720,
                        title: "Preuve de l'Envoi", content: `Pour les communications effectuées par courrier électronique, l'accusé de réception fera foi de la réception. Pour les envois par courrier, l'accusé de réception postal ou le reçu de livraison servira de preuve de réception.`, paddingBottom: 100
                    }),
                    createText(`La présente clause garantit que toutes les communications importantes liées au contrat sont réalisées de manière formelle, claire et traçable, évitant ainsi les malentendus et fournissant une trace documentée en cas de besoin.`),

                    // Article 17
                    createTitle({ text: "Article 17 - Signatures", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),

                    createText(`Ce contrat est signé en deux exemplaires originaux, chacun desquels est considéré comme authentique. Chaque partie reconnaît avoir reçu un exemplaire.`),
                    createText(`En signant ci-dessous, les représentants de chacune des parties déclarent qu'ils sont dûment autorisés à engager respectivement leur entreprise. Ils reconnaissent également avoir lu, compris et accepté tous les termes et conditions énoncés dans ce contrat.`),

                    // Signatures
                    new Table({
                        width: { size: 100, type: "pct" },
                        rows: [
                            new TableRow({
                                children: [
                                    cell([
                                        createTitle({
                                            text: "Pour le Bailleur",
                                            paddingTop: 400,
                                            paddingBottom: 100,
                                            size: 11,
                                            bold: true,
                                        }),
                                        createTitleContent({
                                            title: "Nom",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Titre",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Signature",
                                            content: "",
                                            paddingBottom: 100,
                                        }),
                                    ]),

                                    cell([
                                        createTitle({
                                            text: "Pour la Régis publicitaire",
                                            paddingTop: 400,
                                            paddingBottom: 100,
                                            size: 11,
                                            underline: true,
                                            bold: true,
                                        }),
                                        createTitleContent({
                                            title: "Nom",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Titre",
                                            content: "_______________________________",
                                            paddingBottom: 100,
                                        }),
                                        createTitleContent({
                                            title: "Signature",
                                            content: "",
                                            paddingBottom: 100,
                                        }),
                                    ]),
                                ],
                            }),
                        ],
                    }),

                    new Paragraph({ children: [new PageBreak()] }),
                    createTitle({ text: "ANNEXES", paddingTop: 400, paddingBottom: 100, size: 11, underline: true, bold: true }),
                    createText(`Photo de la facade`, 0, 0),
                    ...createImagesTable(contract.lessor.images),
                    createText(``, 10),
                    createText(`Localisation exact : ${contract.lessor.address}`, 0, 0),
                    createText(`Liens google maps : ${contract.lessor.gmaps}`, 0, 0),

                ],
            },
        ],

    });

    return await Packer.toBlob(doc);
}

