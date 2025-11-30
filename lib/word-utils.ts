import { ContractItemType } from '@/types/contract-types';
import { TitleContentType, TitleType } from '@/types/word.types';
import { Paragraph, TextRun, AlignmentType, BorderStyle, TableCell, TableRow, Table, WidthType, Footer, PageNumber, PageBreak } from 'docx';


export function createFooter(filename: string) {
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

export function createBillboardParagraphs(item: ContractItemType, currency: string, index: number): Paragraph[] {
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

export function createTitle({ text, bold = false, size = 10, paddingTop = 200, paddingBottom = 400, paddingLeft = 0, paddingRight = 0, underline }: TitleType) {
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

export function createTitleContent({ title, content, paddingBottom = 0, indent = 0 }: TitleContentType) {
    return new Paragraph({
        spacing: { after: paddingBottom },
        indent: { firstLine: indent },
        children: [
            new TextRun({ text: `${title} : `, bold: true, font: "Arial" }),
            new TextRun({ text: content, font: "Arial" }),
        ],
    });
}

export function createHeader(country: string, type: "LESSOR" | "CLIENT") {
    const title = type === "CLIENT" ?
        `CONTRAT DE LOCATION DE PANNEAUX PUBLICITAIRES\n${country.toUpperCase()}` :
        `CONTRAT DE LOCATION DE FACADE SUR \nBATIMENT OU TERRAIN PRIVÉE\n${country.toUpperCase()}`;

    const titleRuns = title.split("\n").flatMap((line, index) => [
        new TextRun({
            text: line,
            bold: true,
            size: 30,
            font: "Arial",
        }),
        ...(index < title.split("\n").length - 1 ? [new TextRun({ break: 1 })] : [])
    ]);

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
                                children: titleRuns,
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

export function clientContractOwner(name: string, post: string, paddingBottom: number = 0) {
    return new Paragraph({
        spacing: { after: paddingBottom },
        children: [new TextRun({
            font: "Arial",
            text: `Représentée par ${name}, agissant en qualité de ${post}, dûment habilité à cet effet, ci-après
dénommée le « L’Annonceur ».` })],
    });
}

export function companyContractOwner(name: string, post: string, paddingBottom: number = 0) {
    return new Paragraph({
        spacing: { after: paddingBottom },
        children: [new TextRun({
            font: "Arial",
            text: `Représentée aux fins des présentes par ${name} agissant en qualité de ${post}.
Ci-dessous dénommée « La Régie Publicitaire »` })],
    });
}

export function createText(text: string, paddingBottom: number = 200, indent: number = 720) {
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

export function cell(children: Paragraph[]) {
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