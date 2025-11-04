"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

type Props = {
    totalItems: number;
    pageSize?: number;
    initialPage?: number;
    maxVisiblePages?: number;
    onPageChange?: (page: number) => void;
    controlledPage?: number | null;
};

function buildPageList(totalPages: number, currentPage: number, maxVisible = 7) {
    const pages: Array<number | "ellipsis"> = [];

    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    }

    const sideCount = 1;
    const middleSize = maxVisible - sideCount * 2 - 2;
    const leftBound = Math.max(2, currentPage - Math.floor(middleSize / 2));
    const rightBound = Math.min(totalPages - 1, leftBound + middleSize - 1);
    const adjustedLeft = Math.max(2, Math.min(leftBound, totalPages - 1 - (middleSize - 1)));

    pages.push(1);

    if (adjustedLeft > 2) pages.push("ellipsis");

    for (let p = adjustedLeft; p <= rightBound; p++) pages.push(p);

    if (rightBound < totalPages - 1) pages.push("ellipsis");

    pages.push(totalPages);

    return pages;
}

export default function PaginationComponent({
    totalItems,
    pageSize = 10,
    initialPage = 1,
    maxVisiblePages = 7,
    onPageChange,
    controlledPage = null,
}: Props) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const [internalPage, setInternalPage] = useState<number>(
        Math.min(Math.max(1, initialPage), totalPages)
    );
    const currentPage = controlledPage ?? internalPage;

    useEffect(() => {
        if (currentPage > totalPages) {
            if (controlledPage == null) setInternalPage(totalPages);
            onPageChange?.(totalPages);
        }
    }, [totalPages, currentPage, controlledPage, onPageChange]);

    useEffect(() => {
        onPageChange?.(currentPage);
    }, [currentPage, onPageChange]);

    const pages = useMemo(
        () => buildPageList(totalPages, currentPage, maxVisiblePages),
        [totalPages, currentPage, maxVisiblePages]
    );

    const goTo = (page: number) => {
        const sanitized = Math.min(Math.max(1, page), totalPages);
        if (controlledPage == null) setInternalPage(sanitized);
        onPageChange?.(sanitized);
    };

    const prev = () => currentPage > 1 && goTo(currentPage - 1);
    const next = () => currentPage < totalPages && goTo(currentPage + 1);

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-end mt-4 p-2">
            <div className="flex gap-1 w-auto">
                <div className="size-10">
                    <Button
                        onClick={prev}
                        className="!w-10 !h-10"
                        variant={currentPage === 1 ? "primary" : "inset-primary"}
                        disabled={currentPage === 1}
                        style={{
                            cursor: currentPage === 1 ? "default" : "pointer",
                        }}
                    >
                        <ArrowLeftIcon className="size-4" />
                    </Button>
                </div>

                {pages.map((p, idx) =>
                    p === "ellipsis" ? (
                        <span key={`e-${idx}`} className="size-10" style={{ padding: "6px 12px" }}>
                            …
                        </span>
                    ) : (
                        <div className="size-10">
                            <Button
                                key={p}
                                className="!w-10 !h-10 rounded-md"
                                variant={p === currentPage ? "primary" : "inset-primary"}
                                onClick={() => goTo(Number(p))}
                            >
                                {p}
                            </Button>
                        </div>
                    )
                )}

                <div className="size-10">
                    <Button
                        onClick={next}
                        className="rounded-md !w-10 !h-10"
                        variant={currentPage === totalPages ? "primary" : "inset-primary"}
                        disabled={currentPage === totalPages}
                        style={{
                            cursor: currentPage === totalPages ? "default" : "pointer",
                        }}
                    >
                        <ArrowRightIcon className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
