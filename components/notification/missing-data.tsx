import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { MessageCircleWarningIcon } from 'lucide-react';

type MissingDataProps = {
    title: string;
    content: string;
}

export default function MissingData({ title, content }: MissingDataProps) {
    return (
        <Alert variant="primary">
            <MessageCircleWarningIcon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {content}
            </AlertDescription>
        </Alert>
    )
}
