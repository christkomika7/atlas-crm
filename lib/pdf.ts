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
        headerText?: string; // Nouveau: texte du header
    } = {}
): Promise<void> => {
    const { quality = 0.98, scale = 4, margin = 0, padding = 20, headerText = '' } = options;

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
        wrapper.style.paddingBottom = '40px'; // Padding bottom ajouté
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

        // Hauteur disponible avec padding bottom de 40px (≈14mm) et espace pour footer (≈10mm)
        const paddingBottomMM = 14;
        const footerHeightMM = 10;
        const headerHeightMM = 10; // Espace pour le header sur pages suivantes
        const availableHeightFirstPage = A4_HEIGHT_MM - (2 * margin) - paddingBottomMM - footerHeightMM;
        const availableHeightOtherPages = A4_HEIGHT_MM - (2 * margin) - paddingBottomMM - footerHeightMM - headerHeightMM;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, precision: 16 });
        const imgData = canvas.toDataURL('image/jpeg', quality);

        // Calculer le nombre total de pages
        let totalPages = 1;
        if (imgHeight > availableHeightFirstPage) {
            let remainingAfterFirstPage = imgHeight - availableHeightFirstPage;
            totalPages = 1 + Math.ceil(remainingAfterFirstPage / availableHeightOtherPages);
        }

        if (imgHeight <= availableHeightFirstPage) {
            // Une seule page
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');

            // Footer centré
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            const footerText = `1/${totalPages}`;
            const footerX = A4_WIDTH_MM / 2;
            const footerY = A4_HEIGHT_MM - margin - 5;
            pdf.text(footerText, footerX, footerY, { align: 'center' });

        } else {
            // Plusieurs pages
            let remainingHeight = imgHeight;
            let currentPosition = 0;
            let pageNumber = 0;

            while (remainingHeight > 0.5) {
                if (pageNumber > 0) pdf.addPage();

                const isFirstPage = pageNumber === 0;
                const availableHeight = isFirstPage ? availableHeightFirstPage : availableHeightOtherPages;
                const contentStartY = isFirstPage ? margin : margin + headerHeightMM;

                const heightForThisPage = Math.min(remainingHeight, availableHeight);

                const sourceY = (currentPosition / imgHeight) * canvas.height;
                const sourceHeight = Math.min((heightForThisPage / imgHeight) * canvas.height, canvas.height - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.ceil(sourceHeight);

                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvas, 0, Math.floor(sourceY), canvas.width, Math.ceil(sourceHeight), 0, 0, canvas.width, Math.ceil(sourceHeight));
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
                    pdf.addImage(pageImgData, 'JPEG', margin, contentStartY, imgWidth, heightForThisPage, undefined, 'FAST');
                }

                // Header (seulement à partir de la page 2)
                if (!isFirstPage && headerText) {
                    pdf.setFontSize(10);
                    pdf.setTextColor(100);
                    const headerX = A4_WIDTH_MM / 2;
                    const headerY = margin + 5;
                    pdf.text(headerText, headerX, headerY, { align: 'center' });
                }

                // Footer centré avec numéro de page
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                const footerText = `${pageNumber + 1}/${totalPages}`;
                const footerX = A4_WIDTH_MM / 2;
                const footerY = A4_HEIGHT_MM - margin - 5;
                pdf.text(footerText, footerX, footerY, { align: 'center' });

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
        headerText?: string; // Nouveau: texte du header
    } = {}
): Promise<void> => {
    const { quality = 0.98, scale = 4, margin = 0, padding = 20, headerText = '' } = options;

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
        container.style.paddingBottom = '40px'; // Padding bottom ajouté
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

        // Hauteur disponible avec padding bottom de 40px (≈14mm) et espace pour footer (≈10mm)
        const paddingBottomMM = 14;
        const footerHeightMM = 10;
        const headerHeightMM = 10; // Espace pour le header sur pages suivantes
        const availableHeightFirstPage = A4_HEIGHT_MM - (2 * margin) - paddingBottomMM - footerHeightMM;
        const availableHeightOtherPages = A4_HEIGHT_MM - (2 * margin) - paddingBottomMM - footerHeightMM - headerHeightMM;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, precision: 16 });
        const imgData = canvas.toDataURL('image/jpeg', quality);

        // Calculer le nombre total de pages
        let totalPages = 1;
        if (imgHeight > availableHeightFirstPage) {
            let remainingAfterFirstPage = imgHeight - availableHeightFirstPage;
            totalPages = 1 + Math.ceil(remainingAfterFirstPage / availableHeightOtherPages);
        }

        if (imgHeight <= availableHeightFirstPage) {
            // Une seule page
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');

            // Footer centré
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            const footerText = `1/${totalPages}`;
            const footerX = A4_WIDTH_MM / 2;
            const footerY = A4_HEIGHT_MM - margin - 5;
            pdf.text(footerText, footerX, footerY, { align: 'center' });

        } else {
            // Plusieurs pages
            let remainingHeight = imgHeight;
            let currentPosition = 0;
            let pageNumber = 0;

            while (remainingHeight > 0.5) {
                if (pageNumber > 0) pdf.addPage();

                const isFirstPage = pageNumber === 0;
                const availableHeight = isFirstPage ? availableHeightFirstPage : availableHeightOtherPages;
                const contentStartY = isFirstPage ? margin : margin + headerHeightMM;

                const heightForThisPage = Math.min(remainingHeight, availableHeight);

                const sourceY = (currentPosition / imgHeight) * canvas.height;
                const sourceHeight = Math.min((heightForThisPage / imgHeight) * canvas.height, canvas.height - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.ceil(sourceHeight);

                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvas, 0, Math.floor(sourceY), canvas.width, Math.ceil(sourceHeight), 0, 0, canvas.width, Math.ceil(sourceHeight));
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
                    pdf.addImage(pageImgData, 'JPEG', margin, contentStartY, imgWidth, heightForThisPage, undefined, 'FAST');
                }

                // Header (seulement à partir de la page 2)
                if (!isFirstPage && headerText) {
                    pdf.setFontSize(10);
                    pdf.setTextColor(100);
                    const headerX = A4_WIDTH_MM / 2;
                    const headerY = margin + 5;
                    pdf.text(headerText, headerX, headerY, { align: 'center' });
                }

                // Footer centré avec numéro de page
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                const footerText = `${pageNumber + 1}/${totalPages}`;
                const footerX = A4_WIDTH_MM / 2;
                const footerY = A4_HEIGHT_MM - margin - 5;
                pdf.text(footerText, footerX, footerY, { align: 'center' });

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

export const renderComponentToPDF = async (
    component: React.ReactNode,
    options: {
        quality?: number;
        scale?: number;
        margin?: number;
        padding?: number;
        headerText?: string; // Nouveau: texte du header
    } = {}
): Promise<ArrayBuffer> => {
    const { quality = 0.98, scale = 4, margin = 0, padding = 20, headerText = '' } = options;
    const ReactDOM = await import("react-dom/client");

    try {
        const A4_WIDTH_PX = 794;
        const A4_HEIGHT_PX = 1123;

        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.width = `${A4_WIDTH_PX}px`;
        container.style.minHeight = `${A4_HEIGHT_PX}px`;
        container.style.padding = `${padding}px`;
        container.style.paddingBottom = '40px'; // Padding bottom ajouté
        container.style.backgroundColor = "#ffffff";
        container.style.boxSizing = "border-box";
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
                        if (val && val !== 'auto' && val !== '0px' && val !== '1' && val !== 'normal') {
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

        const imgWidth = A4_WIDTH_MM - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Hauteur disponible avec padding bottom de 40px (≈14mm) et espace pour footer (≈10mm)
        const paddingBottomMM = 14;
        const footerHeightMM = 10;
        const headerHeightMM = 10; // Espace pour le header sur pages suivantes
        const availableHeightFirstPage = A4_HEIGHT_MM - (2 * margin) - paddingBottomMM - footerHeightMM;
        const availableHeightOtherPages = A4_HEIGHT_MM - (2 * margin) - paddingBottomMM - footerHeightMM - headerHeightMM;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
            precision: 16
        });

        const imgData = canvas.toDataURL("image/jpeg", quality);

        // Calculer le nombre total de pages
        let totalPages = 1;
        if (imgHeight > availableHeightFirstPage) {
            let remainingAfterFirstPage = imgHeight - availableHeightFirstPage;
            totalPages = 1 + Math.ceil(remainingAfterFirstPage / availableHeightOtherPages);
        }

        if (imgHeight <= availableHeightFirstPage) {
            // Une seule page
            pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight, undefined, 'FAST');

            // Footer centré
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            const footerText = `1/${totalPages}`;
            const footerX = A4_WIDTH_MM / 2;
            const footerY = A4_HEIGHT_MM - margin - 5;
            pdf.text(footerText, footerX, footerY, { align: 'center' });

        } else {
            // Plusieurs pages
            let remainingHeight = imgHeight;
            let currentPosition = 0;
            let pageNumber = 0;

            while (remainingHeight > 0.5) {
                if (pageNumber > 0) pdf.addPage();

                const isFirstPage = pageNumber === 0;
                const availableHeight = isFirstPage ? availableHeightFirstPage : availableHeightOtherPages;
                const contentStartY = isFirstPage ? margin : margin + headerHeightMM;

                const heightForThisPage = Math.min(remainingHeight, availableHeight);

                const sourceY = (currentPosition / imgHeight) * canvas.height;
                const sourceHeight = Math.min((heightForThisPage / imgHeight) * canvas.height, canvas.height - sourceY);

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
                    const pageImgData = pageCanvas.toDataURL("image/jpeg", quality);
                    pdf.addImage(pageImgData, "JPEG", margin, contentStartY, imgWidth, heightForThisPage, undefined, 'FAST');
                }

                // Header (seulement à partir de la page 2)
                if (!isFirstPage && headerText) {
                    pdf.setFontSize(10);
                    pdf.setTextColor(100);
                    const headerX = A4_WIDTH_MM / 2;
                    const headerY = margin + 5;
                    pdf.text(headerText, headerX, headerY, { align: 'center' });
                }

                // Footer centré avec numéro de page
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                const footerText = `${pageNumber + 1}/${totalPages}`;
                const footerX = A4_WIDTH_MM / 2;
                const footerY = A4_HEIGHT_MM - margin - 5;
                pdf.text(footerText, footerX, footerY, { align: 'center' });

                currentPosition += heightForThisPage;
                remainingHeight -= heightForThisPage;
                pageNumber++;

                if (pageNumber > 100) break; // sécurité
            }
        }

        return pdf.output("arraybuffer");

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    }
};