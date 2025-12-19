import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export const downloadComponentAsPDF = async (
    elementId: string,
    filename: string = 'document.pdf',
    options: {
        quality?: number;
        scale?: number;
        margin?: number;
        padding?: number;
        headerText?: string;
    } = {}
): Promise<void> => {
    const {
        quality = 0.98,
        scale = 4,
        margin = 0,
        padding = 10,
        headerText = '',
    } = options;

    const DEFAULT_HEADER_TEXT = 'DOCUMENT CONFIDENTIEL';
    const A4_WIDTH_PX = 794;
    try {
        const element = document.getElementById(elementId);
        if (!element) throw new Error(`L'élément avec l'ID "${elementId}" n'a pas été trouvé`);

        const paddingBottom = 30;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';
        wrapper.style.width = `${A4_WIDTH_PX}px`;
        wrapper.style.padding = `${padding}px`;
        wrapper.style.paddingBottom = `${paddingBottom}px`;
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.boxSizing = 'border-box';

        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.style.width = `${A4_WIDTH_PX}px`;
        clonedElement.style.maxWidth = `${A4_WIDTH_PX}px`;
        clonedElement.style.boxSizing = 'border-box';
        clonedElement.style.margin = '0';
        clonedElement.style.padding = '0';

        wrapper.appendChild(clonedElement);
        document.body.appendChild(wrapper);

        await document.fonts.ready;
        await new Promise(res => setTimeout(res, 300));

        const forceStyleRecalculation = (el: HTMLElement) => {
            const allElements = [el, ...Array.from(el.querySelectorAll('*'))] as HTMLElement[];

            allElements.forEach((element) => {
                const computed = window.getComputedStyle(element);

                if (computed.transform && computed.transform !== 'none') {
                    element.style.transform = computed.transform;
                    element.style.willChange = 'transform';
                }

                [
                    'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
                    'position', 'top', 'right', 'bottom', 'left', 'display',
                    'flexDirection', 'flexWrap', 'justifyContent', 'alignItems',
                    'backgroundColor', 'overflow', 'opacity', 'width', 'height',
                    'gap', 'rowGap', 'columnGap', 'zIndex',
                ].forEach((prop) => {
                    const val = (computed as any)[prop];
                    if (val && val !== 'auto' && val !== '0px' && val !== 'normal') {
                        (element.style as any)[prop] = val;
                    }
                });
            });
        };

        forceStyleRecalculation(clonedElement);
        await new Promise(res => setTimeout(res, 200));

        const canvas = await html2canvas(wrapper, {
            scale,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: A4_WIDTH_PX,
            height: wrapper.scrollHeight,
            windowWidth: A4_WIDTH_PX,
            windowHeight: wrapper.scrollHeight,
        });

        document.body.removeChild(wrapper);

        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;
        const imgWidth = A4_WIDTH_MM - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const paddingBottomMM = 14;
        const footerHeightMM = 10;
        const headerHeightMM = 10;

        const availableHeightFirstPage = A4_HEIGHT_MM - margin - paddingBottomMM - footerHeightMM;
        const availableHeightOtherPages = A4_HEIGHT_MM - margin - headerHeightMM - paddingBottomMM - footerHeightMM;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
            precision: 16,
        });

        const imgData = canvas.toDataURL('image/jpeg', quality);
        const TOLERANCE = 5;

        const fitsOnOnePage = imgHeight <= availableHeightFirstPage + TOLERANCE;

        if (fitsOnOnePage) {
            const startY = margin;
            const maxContentHeight = A4_HEIGHT_MM - startY - paddingBottomMM - footerHeightMM;
            const finalHeight = Math.min(imgHeight, maxContentHeight);

            pdf.addImage(imgData, 'JPEG', margin, startY, imgWidth, finalHeight, undefined, 'FAST');
            pdf.save(filename);
            return;
        }

        let currentPosition = 0;
        let pageNumber = 0;

        while (currentPosition < imgHeight - 0.5) {
            if (pageNumber > 0) pdf.addPage();

            const isFirstPage = pageNumber === 0;
            const availableHeight = isFirstPage ? availableHeightFirstPage : availableHeightOtherPages;
            const remainingHeight = imgHeight - currentPosition;
            let heightForThisPage = Math.min(availableHeight, remainingHeight);

            if (heightForThisPage < 5 && pageNumber > 0) {
                break;
            }

            const contentStartY = isFirstPage ? margin : margin + headerHeightMM;

            const sourceY = (currentPosition / imgHeight) * canvas.height;
            const sourceHeight = (heightForThisPage / imgHeight) * canvas.height;

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.ceil(sourceHeight);

            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(
                    canvas,
                    0,
                    Math.floor(sourceY),
                    canvas.width,
                    Math.ceil(sourceHeight),
                    0,
                    0,
                    canvas.width,
                    Math.ceil(sourceHeight)
                );

                pdf.addImage(
                    pageCanvas.toDataURL('image/jpeg', quality),
                    'JPEG',
                    margin,
                    contentStartY,
                    imgWidth,
                    heightForThisPage,
                    undefined,
                    'FAST'
                );
            }

            currentPosition += heightForThisPage;
            pageNumber++;
        }

        const totalPages = pdf.getNumberOfPages();
        const shouldShowHeader = totalPages >= 2;
        const effectiveHeaderText = shouldShowHeader ? (headerText || DEFAULT_HEADER_TEXT) : '';

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            if (i > 1 && shouldShowHeader && effectiveHeaderText) {
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                pdf.text(effectiveHeaderText, A4_WIDTH_MM / 2, margin + 5, { align: 'center' });
            }

            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`${i}/${totalPages}`, A4_WIDTH_MM / 2, A4_HEIGHT_MM - margin - 5, { align: 'center' });
        }

        pdf.save(filename);

    } catch (error) {
        console.error('❌ Erreur lors de la génération du PDF:', error);
        throw error;
    }
};

export const renderComponentToPDF = async (
    component: React.ReactNode,
    options: {
        quality?: number;
        scale?: number;
        margin?: number;
        padding?: number;
        headerText?: string;
    } = {}
): Promise<ArrayBuffer> => {
    const {
        quality = 0.98,
        scale = 4,
        margin = 0,
        padding = 10, // ✅ Réduit de 20 à 10
        headerText = ''
    } = options;

    const DEFAULT_HEADER_TEXT = 'DOCUMENT CONFIDENTIEL';
    const A4_WIDTH_PX = 794;

    const ReactDOM = await import("react-dom/client");

    try {
        const paddingBottom = 30; // ✅ Réduit de 40 à 30

        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.width = `${A4_WIDTH_PX}px`;
        container.style.padding = `${padding}px`;
        container.style.paddingBottom = `${paddingBottom}px`;
        container.style.backgroundColor = "#ffffff";
        container.style.boxSizing = "border-box";
        // ✅ Pas de maxHeight ni overflow:hidden pour permettre le contenu long

        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);
        await new Promise<void>((resolve) => {
            root.render(component as React.ReactElement);
            setTimeout(resolve, 500);
        });

        await document.fonts.ready;
        await new Promise((res) => setTimeout(res, 300));

        // Fonction pour forcer recalcul des styles
        const forceStyleRecalculation = (el: HTMLElement) => {
            const allElements = [el, ...Array.from(el.querySelectorAll('*'))] as HTMLElement[];

            allElements.forEach((element) => {
                const computed = window.getComputedStyle(element);

                // Espacements négatifs Tailwind
                const classList = Array.from(element.parentElement?.classList || []);
                const hasNegativeSpaceY = classList.some(cls => cls.startsWith('-space-y-'));
                const hasNegativeSpaceX = classList.some(cls => cls.startsWith('-space-x-'));

                if (hasNegativeSpaceY || hasNegativeSpaceX) {
                    const children = Array.from(element.parentElement?.children || []) as HTMLElement[];
                    children.forEach((child, index) => {
                        if (index === children.length - 1) return;

                        if (hasNegativeSpaceY) {
                            const marginTop = window.getComputedStyle(child).marginTop;
                            if (marginTop) child.style.marginTop = marginTop;
                            const marginBottom = window.getComputedStyle(child).marginBottom;
                            if (marginBottom) child.style.marginBottom = marginBottom;
                        }
                        if (hasNegativeSpaceX) {
                            const marginLeft = window.getComputedStyle(child).marginLeft;
                            if (marginLeft) child.style.marginLeft = marginLeft;
                            const marginRight = window.getComputedStyle(child).marginRight;
                            if (marginRight) child.style.marginRight = marginRight;
                        }
                    });
                }

                // Transformations
                if (computed.transform && computed.transform !== 'none') {
                    element.style.transform = computed.transform;
                    element.style.willChange = 'transform';
                }

                // Styles généraux
                ['marginTop', 'marginBottom', 'marginLeft', 'marginRight',
                    'position', 'top', 'right', 'bottom', 'left', 'display',
                    'flexDirection', 'flexWrap', 'justifyContent', 'alignItems',
                    'backgroundColor', 'overflow', 'opacity', 'width', 'height',
                    'gap', 'rowGap', 'columnGap', 'zIndex'].forEach((prop) => {
                        const val = (computed as any)[prop];
                        if (val && val !== 'auto' && val !== '0px' && val !== 'normal') {
                            (element.style as any)[prop] = val;
                        }
                    });
            });
        };

        forceStyleRecalculation(container);
        await new Promise(res => setTimeout(res, 200));

        const canvas = await html2canvas(container, {
            scale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
            imageTimeout: 0,
            removeContainer: false,
            width: A4_WIDTH_PX,
            height: container.scrollHeight,
            windowWidth: A4_WIDTH_PX,
            windowHeight: container.scrollHeight,
            foreignObjectRendering: false,
            onclone: (clonedDoc, clonedWrapper) => {
                const clonedInner = clonedWrapper as HTMLElement;
                if (clonedInner) forceStyleRecalculation(clonedInner);
            }
        });

        root.unmount();
        document.body.removeChild(container);

        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;
        const imgWidth = A4_WIDTH_MM - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const paddingBottomMM = 14;
        const footerHeightMM = 10;
        const headerHeightMM = 10;

        const availableHeightFirstPage = A4_HEIGHT_MM - margin - paddingBottomMM - footerHeightMM;
        const availableHeightOtherPages = A4_HEIGHT_MM - margin - headerHeightMM - paddingBottomMM - footerHeightMM;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
            precision: 16
        });

        const imgData = canvas.toDataURL("image/jpeg", quality);
        const TOLERANCE = 5; // ✅ Tolérance augmentée

        const fitsOnOnePage = imgHeight <= availableHeightFirstPage + TOLERANCE;

        if (fitsOnOnePage) {
            // ✅ Une seule page
            const startY = margin;
            const maxContentHeight = A4_HEIGHT_MM - startY - paddingBottomMM - footerHeightMM;
            const finalHeight = Math.min(imgHeight, maxContentHeight);

            pdf.addImage(imgData, "JPEG", margin, startY, imgWidth, finalHeight, undefined, 'FAST');

            // Footer
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text('1/1', A4_WIDTH_MM / 2, A4_HEIGHT_MM - margin - 5, { align: 'center' });

            return pdf.output("arraybuffer");
        }

        // ✅ Plusieurs pages
        let currentPosition = 0;
        let pageNumber = 0;

        while (currentPosition < imgHeight - 0.5) {
            if (pageNumber > 0) pdf.addPage();

            const isFirstPage = pageNumber === 0;
            const availableHeight = isFirstPage ? availableHeightFirstPage : availableHeightOtherPages;
            const remainingHeight = imgHeight - currentPosition;
            let heightForThisPage = Math.min(availableHeight, remainingHeight);

            if (heightForThisPage < 5 && pageNumber > 0) {
                break;
            }

            const contentStartY = isFirstPage ? margin : margin + headerHeightMM;

            const sourceY = (currentPosition / imgHeight) * canvas.height;
            const sourceHeight = (heightForThisPage / imgHeight) * canvas.height;

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.ceil(sourceHeight);

            const ctx = pageCanvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(
                    canvas,
                    0,
                    Math.floor(sourceY),
                    canvas.width,
                    Math.ceil(sourceHeight),
                    0,
                    0,
                    canvas.width,
                    Math.ceil(sourceHeight)
                );

                pdf.addImage(
                    pageCanvas.toDataURL("image/jpeg", quality),
                    "JPEG",
                    margin,
                    contentStartY,
                    imgWidth,
                    heightForThisPage,
                    undefined,
                    'FAST'
                );
            }

            currentPosition += heightForThisPage;
            pageNumber++;

            if (pageNumber > 100) break; // Sécurité
        }

        const totalPages = pdf.getNumberOfPages();
        const shouldShowHeader = totalPages >= 2;
        const effectiveHeaderText = shouldShowHeader ? (headerText || DEFAULT_HEADER_TEXT) : '';

        // Ajouter headers et footers
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            if (i > 1 && shouldShowHeader && effectiveHeaderText) {
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                pdf.text(effectiveHeaderText, A4_WIDTH_MM / 2, margin + 5, { align: 'center' });
            }

            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`${i}/${totalPages}`, A4_WIDTH_MM / 2, A4_HEIGHT_MM - margin - 5, { align: 'center' });
        }

        return pdf.output("arraybuffer");

    } catch (error) {
        console.error('❌ Erreur lors de la génération du PDF:', error);
        throw error;
    }
};
export const downloadBrochureAsPDF = async (
    component: React.ReactNode,
    filename: string = 'document.pdf',
    options: {
        quality?: number;
        scale?: number;
        margin?: number;
        padding?: number;
    } = {}
): Promise<void> => {
    const { quality = 0.98, scale = 4, margin = 0, padding = 20 } = options;

    const ReactDOM = await import('react-dom/client');

    try {
        const A4_WIDTH_PX = 794;
        const A4_HEIGHT_PX = 1123;

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = `${A4_WIDTH_PX}px`;
        container.style.minHeight = `${A4_HEIGHT_PX}px`;
        container.style.padding = `${padding}px`;
        container.style.backgroundColor = '#ffffff';
        container.style.boxSizing = 'border-box';
        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);
        await new Promise<void>((resolve) => {
            root.render(component as React.ReactElement);
            setTimeout(resolve, 500);
        });

        await document.fonts.ready;
        await new Promise(res => setTimeout(res, 200));

        const canvas = await html2canvas(container, {
            scale,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: A4_WIDTH_PX,
            height: container.scrollHeight,
        });

        root.unmount();
        document.body.removeChild(container);

        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;
        const imgWidth = A4_WIDTH_MM - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const availableHeight = A4_HEIGHT_MM - 2 * margin;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

        if (imgHeight <= availableHeight) {
            pdf.addImage(canvas.toDataURL('image/jpeg', quality), 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
        } else {
            let remainingHeight = imgHeight;
            let currentPosition = 0;

            while (remainingHeight > 0.5) {
                if (currentPosition > 0) pdf.addPage();

                const heightForThisPage = Math.min(remainingHeight, availableHeight);
                const sourceY = (currentPosition / imgHeight) * canvas.height;
                const sourceHeight = Math.min((heightForThisPage / imgHeight) * canvas.height, canvas.height - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.ceil(sourceHeight);

                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvas, 0, Math.floor(sourceY), canvas.width, Math.ceil(sourceHeight), 0, 0, canvas.width, Math.ceil(sourceHeight));
                    pdf.addImage(pageCanvas.toDataURL('image/jpeg', quality), 'JPEG', margin, margin, imgWidth, heightForThisPage, undefined, 'FAST');
                }

                currentPosition += heightForThisPage;
                remainingHeight -= heightForThisPage;
            }
        }

        pdf.save(filename);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    }
};
