import htmlToDocx from '@turbodocx/html-to-docx';
import { saveAs } from 'file-saver';

export async function exportHtmlToWord(elementId: string, fileName: string) {
    try {
        const element = document.getElementById(elementId);
        if (!element) throw new Error(`Element with id "${elementId}" not found`);

        const htmlString = element.outerHTML;

        // Conversion HTML -> DOCX
        const docxData = await htmlToDocx(htmlString);

        // Forcer en ArrayBuffer standard
        let arrayBuffer: ArrayBuffer;
        if (docxData instanceof ArrayBuffer) {
            arrayBuffer = docxData;
        } else if (docxData instanceof Blob) {
            arrayBuffer = await docxData.arrayBuffer();
        } else {
            // Node.js Buffer ou ArrayBufferLike
            arrayBuffer = new Uint8Array(docxData).buffer;
        }

        // Créer le Blob
        const blob = new Blob([arrayBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        saveAs(blob, fileName);

    } catch (error) {
        console.error('Erreur lors de l’export Word:', error);
    }
}
