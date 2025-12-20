'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { initialName, resolveImageSrc, urlToFile } from '@/lib/utils';
import React, { useEffect, useState } from 'react'

type BillboardPhotoProps = {
    path?: string;
    name: string
}

export default function BillboardPhoto({ path, name }: BillboardPhotoProps) {
    const [profil, setProfil] = useState("");
    async function getProfil() {
        if (path) {
            const file = await urlToFile(path);
            const resolveImage = resolveImageSrc(file);
            if (resolveImage) {
                setProfil(resolveImage)
            }
        }
    }

    useEffect(() => {
        getProfil()
    }, [path])
    return (
        <div className="flex justify-center">
            <Avatar className="!size-12">
                <AvatarImage src={profil} />
                <AvatarFallback>{initialName(name)}</AvatarFallback>
            </Avatar>
        </div>
    )
}
