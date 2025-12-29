export const downloadBrochurePDF = async (
    component: React.ReactNode,
    files: string[],
    options: {
        quality?: number;
        scale?: number;
        margin?: number;
        padding?: number;
    } = {}
): Promise<void> => {

    const {
        quality = 0.98,
        scale = 4
    } = options;

    const A4_WIDTH_PX = 794;
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    const ReactDOM = await import("react-dom/client");

    try {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.width = `${A4_WIDTH_PX}px`;
        container.style.background = "#fff";

        document.body.appendChild(container);

        const root = ReactDOM.createRoot(container);
        await new Promise<void>((resolve) => {
            root.render(component as React.ReactElement);
            setTimeout(resolve, 800);
        });

        await document.fonts.ready;

        const contentHeight = Math.max(container.scrollHeight, container.offsetHeight);

        const canvas = await html2canvas(container, {
            scale,
            backgroundColor: "#ffffff",
            useCORS: true,
            width: A4_WIDTH_PX,
            height: contentHeight,
        });

        root.unmount();
        document.body.removeChild(container);

        const generatedPdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        });

        const pageHeightPx = (A4_HEIGHT_MM * canvas.width) / A4_WIDTH_MM;

        let offsetY = 0;
        let pageIndex = 0;

        while (offsetY < canvas.height) {
            const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetY);

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;

            const ctx = pageCanvas.getContext("2d")!;
            ctx.drawImage(
                canvas,
                0,
                offsetY,
                canvas.width,
                sliceHeight,
                0,
                0,
                canvas.width,
                sliceHeight
            );

            if (pageIndex > 0) generatedPdf.addPage();

            const renderHeightMM = (sliceHeight * A4_WIDTH_MM) / canvas.width;

            generatedPdf.addImage(
                pageCanvas.toDataURL("image/jpeg", quality),
                "JPEG",
                0,
                0,
                A4_WIDTH_MM,
                renderHeightMM
            );

            offsetY += sliceHeight;
            pageIndex++;
        }

        const finalPdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const addImagePage = async (url: string) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;

            await new Promise((res) => (img.onload = res));

            finalPdf.addPage();
            finalPdf.addImage(
                img,
                "JPEG",
                0,
                0,
                A4_WIDTH_MM,
                A4_HEIGHT_MM
            );
        };

        const addPdfPages = async (url: string) => {
            const arrayBuffer = await fetch(url).then(r => r.arrayBuffer());

            const pdfjs = await import('pdfjs-dist' + '/legacy/build/pdf');
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            const total = pdfDoc.numPages;

            for (let i = 1; i <= total; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = Math.ceil(viewport.width);
                pageCanvas.height = Math.ceil(viewport.height);

                const ctx = pageCanvas.getContext('2d')!;
                await page.render({ canvasContext: ctx, viewport }).promise;

                finalPdf.addPage();
                finalPdf.addImage(
                    pageCanvas.toDataURL('image/jpeg', quality),
                    "JPEG",
                    0,
                    0,
                    A4_WIDTH_MM,
                    A4_HEIGHT_MM
                );
            }
        };

        const first = files.slice(0, 3);
        const last = files.slice(3);

        for (const file of first) {
            file.endsWith(".pdf")
                ? await addPdfPages(file)
                : await addImagePage(file);
        }


        {
            const genArrayBuffer = generatedPdf.output("arraybuffer");
            const pdfjsModule = await import('pdfjs-dist' + '/legacy/build/pdf');
            const pdfjs: any = (pdfjsModule as any).default || pdfjsModule;
            const loadingTask = pdfjs.getDocument({ data: genArrayBuffer });
            const genDoc = await loadingTask.promise;
            const generatedPages = genDoc.numPages;

            for (let i = 1; i <= generatedPages; i++) {
                const page = await genDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = Math.ceil(viewport.width);
                pageCanvas.height = Math.ceil(viewport.height);

                const ctx = pageCanvas.getContext('2d')!;
                await page.render({ canvasContext: ctx, viewport }).promise;

                finalPdf.addPage();
                finalPdf.addImage(
                    pageCanvas.toDataURL("image/jpeg", quality),
                    "JPEG",
                    0,
                    0,
                    A4_WIDTH_MM,
                    A4_HEIGHT_MM
                );
            }
        }

        for (const file of last) {
            file.endsWith(".pdf")
                ? await addPdfPages(file)
                : await addImagePage(file);
        }

        finalPdf.deletePage(1);
        finalPdf.save(`brochure-final-${Date.now()}.pdf`);

    } catch (err) {
        console.error("❌ PDF generation error:", err);
        throw err;
    }
};
