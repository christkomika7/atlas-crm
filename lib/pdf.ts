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
    } = {}
): Promise<void> => {
    const { quality = 0.98, scale = 4, margin = 0, padding = 20 } = options;

    try {
        const element = document.getElementById(elementId);
        if (!element) throw new Error(`L'élément avec l'ID "${elementId}" n'a pas été trouvé`);

        const A4_WIDTH_PX = 794;
        const A4_HEIGHT_PX = 1123;

        // Wrapper temporaire
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';
        wrapper.style.width = `${A4_WIDTH_PX}px`;
        wrapper.style.minHeight = `${A4_HEIGHT_PX}px`;
        wrapper.style.padding = `${padding}px`;
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.boxSizing = 'border-box';

        // Cloner l'élément
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

                // Transformations : conserver le transform global
                if (computed.transform && computed.transform !== 'none') {
                    element.style.transform = computed.transform;
                    element.style.willChange = 'transform';
                }

                // Styles généraux : marges, positions, display, flex, background, overflow, opacity, width/height
                ['marginTop', 'marginBottom', 'marginLeft', 'marginRight',
                    'position', 'top', 'right', 'bottom', 'left', 'display',
                    'flexDirection', 'flexWrap', 'justifyContent', 'alignItems',
                    'backgroundColor', 'overflow', 'opacity', 'width', 'height',
                    'gap', 'rowGap', 'columnGap', 'zIndex'].forEach((prop) => {
                        const val = (computed as any)[prop];
                        if (val && val !== 'auto' && val !== '0px' && val !== '1' && val !== 'normal') {
                            (element.style as any)[prop] = val;
                        }
                    });
            });
        };

        forceStyleRecalculation(clonedElement);
        await new Promise(res => setTimeout(res, 200));

        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;

        const canvas = await html2canvas(wrapper, {
            scale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 0,
            removeContainer: false,
            width: A4_WIDTH_PX,
            height: wrapper.scrollHeight,
            windowWidth: A4_WIDTH_PX,
            windowHeight: wrapper.scrollHeight,
            foreignObjectRendering: false,
            onclone: (clonedDoc, clonedWrapper) => {
                const clonedInner = clonedWrapper.querySelector(`#${elementId}`) as HTMLElement;
                if (clonedInner) forceStyleRecalculation(clonedInner);
            }
        });

        document.body.removeChild(wrapper);

        const imgWidth = A4_WIDTH_MM - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const availableHeight = A4_HEIGHT_MM - (2 * margin);

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, precision: 16 });
        const imgData = canvas.toDataURL('image/jpeg', quality);

        if (imgHeight <= availableHeight) {
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
        } else {
            let remainingHeight = imgHeight;
            let currentPosition = 0;
            let pageNumber = 0;

            while (remainingHeight > 0.5) {
                if (pageNumber > 0) pdf.addPage();

                const heightForThisPage = pageNumber === Math.floor(imgHeight / availableHeight)
                    ? remainingHeight
                    : availableHeight;

                const sourceY = (currentPosition / imgHeight) * canvas.height;
                const sourceHeight = Math.min((heightForThisPage / imgHeight) * canvas.height, canvas.height - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.ceil(sourceHeight);

                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvas, 0, Math.floor(sourceY), canvas.width, Math.ceil(sourceHeight), 0, 0, canvas.width, Math.ceil(sourceHeight));
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
                    pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, heightForThisPage, undefined, 'FAST');
                }

                currentPosition += heightForThisPage;
                remainingHeight -= heightForThisPage;
                pageNumber++;

                if (pageNumber > 100) break; // sécurité
            }
        }

        pdf.save(filename);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    }
};

export const downloadInvisibleComponentAsPDF = async (
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

    // Import dynamique de ReactDOM (nécessaire pour le rendu)
    const ReactDOM = await import('react-dom/client');

    try {
        const A4_WIDTH_PX = 794;
        const A4_HEIGHT_PX = 1123;

        // Créer un conteneur temporaire invisible
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

        // Créer une root React et rendre le composant
        const root = ReactDOM.createRoot(container);

        // Attendre que le composant soit rendu
        await new Promise<void>((resolve) => {
            root.render(component as React.ReactElement);
            // Attendre plusieurs ticks pour s'assurer que tout est rendu
            setTimeout(resolve, 500);
        });

        await document.fonts.ready;
        await new Promise(res => setTimeout(res, 300));

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
                        if (val && val !== 'auto' && val !== '0px' && val !== '1' && val !== 'normal') {
                            (element.style as any)[prop] = val;
                        }
                    });
            });
        };

        forceStyleRecalculation(container);
        await new Promise(res => setTimeout(res, 200));

        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;

        const canvas = await html2canvas(container, {
            scale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
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

        // Nettoyer le DOM
        root.unmount();
        document.body.removeChild(container);

        const imgWidth = A4_WIDTH_MM - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const availableHeight = A4_HEIGHT_MM - (2 * margin);

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, precision: 16 });
        const imgData = canvas.toDataURL('image/jpeg', quality);

        if (imgHeight <= availableHeight) {
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
        } else {
            let remainingHeight = imgHeight;
            let currentPosition = 0;
            let pageNumber = 0;

            while (remainingHeight > 0.5) {
                if (pageNumber > 0) pdf.addPage();

                const heightForThisPage = pageNumber === Math.floor(imgHeight / availableHeight)
                    ? remainingHeight
                    : availableHeight;

                const sourceY = (currentPosition / imgHeight) * canvas.height;
                const sourceHeight = Math.min((heightForThisPage / imgHeight) * canvas.height, canvas.height - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.ceil(sourceHeight);

                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvas, 0, Math.floor(sourceY), canvas.width, Math.ceil(sourceHeight), 0, 0, canvas.width, Math.ceil(sourceHeight));
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
                    pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, heightForThisPage, undefined, 'FAST');
                }

                currentPosition += heightForThisPage;
                remainingHeight -= heightForThisPage;
                pageNumber++;

                if (pageNumber > 100) break;
            }
        }

        pdf.save(filename);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
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
    } = {}
): Promise<ArrayBuffer> => {
    const { quality = 0.98, scale = 4, margin = 0, padding = 20 } = options;
    const ReactDOM = await import("react-dom/client");

    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = `${A4_WIDTH_PX}px`;
    container.style.minHeight = `${A4_HEIGHT_PX}px`;
    container.style.padding = `${padding}px`;
    container.style.backgroundColor = "#fff";
    container.style.boxSizing = "border-box";
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    await new Promise<void>((resolve) => {
        root.render(component as React.ReactElement);
        setTimeout(resolve, 500);
    });

    await document.fonts.ready;
    await new Promise((res) => setTimeout(res, 200));

    const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: A4_WIDTH_PX,
        height: container.scrollHeight,
        windowWidth: A4_WIDTH_PX,
        windowHeight: container.scrollHeight,
    });

    root.unmount();
    document.body.removeChild(container);

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const imgWidth = A4_WIDTH_MM - 2 * margin;
    const ratio = imgWidth / canvas.width;
    const availableHeight = A4_HEIGHT_MM - 2 * margin;
    const imgHeight = canvas.height * ratio;

    const imgData = canvas.toDataURL("image/jpeg", quality);

    if (imgHeight <= availableHeight) {
        pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    } else {
        // Pagination améliorée
        const pageHeightPx = Math.floor(availableHeight / ratio);
        const totalPages = Math.ceil(canvas.height / pageHeightPx);

        for (let page = 0; page < totalPages; page++) {
            const yOffset = page * pageHeightPx;
            const remainingHeight = canvas.height - yOffset;

            // Ne créer une page que s'il y a du contenu
            if (remainingHeight <= 0) break;

            const currentPageHeight = Math.min(pageHeightPx, remainingHeight);

            // Éviter les pages avec très peu de contenu (moins de 5% de la hauteur)
            if (currentPageHeight < pageHeightPx * 0.05 && page > 0) break;

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = currentPageHeight;

            const ctx = pageCanvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(
                    canvas,
                    0,
                    yOffset,
                    canvas.width,
                    currentPageHeight,
                    0,
                    0,
                    canvas.width,
                    currentPageHeight
                );
            }

            const pageImg = pageCanvas.toDataURL("image/jpeg", quality);
            const pageImgHeightMM = currentPageHeight * ratio;

            if (page > 0) pdf.addPage();
            pdf.addImage(pageImg, "JPEG", margin, margin, imgWidth, pageImgHeightMM);
        }
    }

    return pdf.output("arraybuffer");
};
