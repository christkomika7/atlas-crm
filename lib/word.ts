import { ContractItemType, ContractType } from '@/types/contract-types';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TableCell, TableRow, Table, WidthType, Footer, PageNumber, PageBreak } from 'docx';
import { formatList, formatNumber } from './utils';
import { TitleContentType, TitleType } from '@/types/word.types';

export async function generateClientContractDocument(contract: ContractType): Promise<Blob> {
    const doc = new Document({
        sections: [
            {
                properties: {},
                footers: {
                    default: createFooter(contract.filename)
                },

                children: [
                    creatHeader(contract.company.country),

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
                    createText(``),

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

function createFooter(filename: string) {
    const noBorders = {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };

    return new Footer({
        children: [
            new Table({
                width: { size: 100, type: "pct" },
                rows: [
                    new TableRow({
                        children: [
                            // Cellule vide gauche
                            new TableCell({
                                children: [new Paragraph("")],
                                borders: noBorders,
                            }),
                            // Cellule titre centrée
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: filename,
                                                bold: true,
                                                size: 20,
                                                font: "Arial",
                                            }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],
                                borders: noBorders,
                            }),
                            // Cellule page à droite
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                children: [PageNumber.CURRENT, " sur ", PageNumber.TOTAL_PAGES],
                                                size: 20,
                                                font: "Arial",
                                            }),
                                        ],
                                        alignment: AlignmentType.RIGHT,
                                    }),
                                ],
                                borders: noBorders,
                            }),
                        ],
                    }),
                ],
                borders: noBorders,
            }),
        ],
    });
}

function createBillboardParagraphs(item: ContractItemType, currency: string, index: number): Paragraph[] {
    return [
        createTitle({ text: `Panneau ${index}`, paddingBottom: 100, paddingLeft: 720 }),
        createTitleContent({ title: "Référence", content: item.reference, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: "Modèle", content: item.model, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: "Dimensions", content: item.dim, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: "Superficie", content: item.area, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: "Site", content: item.site, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: "Éclairage", content: item.lighting, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: "Période de location", content: item.location, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: "Durée", content: item.delay, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: `Prix de location (${currency} HT)`, content: `${item.price} ${currency}`, paddingBottom: 40, indent: 1440 }),
        createTitleContent({ title: `Prix total sur la période (${currency} HT)`, content: `${item.delayPrice} ${currency}`, paddingBottom: 40, indent: 1440 }),

    ];
}

function createTitle({ text, bold = false, size = 10, paddingTop = 200, paddingBottom = 400, paddingLeft = 0, paddingRight = 0, underline }: TitleType) {
    return new Paragraph({
        spacing: { before: paddingTop, after: paddingBottom },
        indent: { left: paddingLeft, right: paddingRight },
        children: [
            new TextRun({
                text,
                bold,
                font: "Arial",
                size: `${size}pt`,
                ...underline && {
                    underline: {}
                }
            }),
        ],
    });
}

function createTitleContent({ title, content, paddingBottom = 0, indent = 0 }: TitleContentType) {
    return new Paragraph({
        spacing: { after: paddingBottom },
        indent: { firstLine: indent },
        children: [
            new TextRun({ text: `${title} : `, bold: true, font: "Arial" }),
            new TextRun({ text: content, font: "Arial" }),
        ],
    });
}

function creatHeader(country: string) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { color: "000000", style: BorderStyle.SINGLE, size: 40 },
            bottom: { color: "000000", style: BorderStyle.SINGLE, size: 40 },
            left: { color: "000000", style: BorderStyle.SINGLE, size: 40 },
            right: { color: "000000", style: BorderStyle.SINGLE, size: 40 },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        margins: {
                            top: 200,
                            bottom: 200,
                            left: 300,
                            right: 300,
                        },
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `CONTRAT DE LOCATION DE PANNEAUX PUBLICITAIRES\n${country.toUpperCase()}`,
                                        bold: true,
                                        size: 30,
                                        font: "Arial"
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

function clientContractOwner(name: string, post: string, paddingBottom: number = 0) {
    return new Paragraph({
        spacing: { after: paddingBottom },
        children: [new TextRun({
            font: "Arial",
            text: `Représentée par ${name}, agissant en qualité de ${post}, dûment habilité à cet effet, ci-après
dénommée le « L’Annonceur ».` })],
    });
}

function companyContractOwner(name: string, post: string, paddingBottom: number = 0) {
    return new Paragraph({
        spacing: { after: paddingBottom },
        children: [new TextRun({
            font: "Arial",
            text: `Représentée aux fins des présentes par ${name} agissant en qualité de ${post}.
Ci-dessous dénommée « La Régie Publicitaire »` })],
    });
}

function createText(text: string, paddingBottom: number = 200, indent: number = 720) {
    return new Paragraph({
        spacing: { after: paddingBottom },
        indent: { firstLine: indent },
        children: [
            new TextRun({
                font: "Arial",
                text,
            }),
        ],
    });
}

function cell(children: Paragraph[]) {
    return new TableCell({
        children,
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
    });
}