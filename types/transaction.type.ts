export type TransactionType = {
    reference: string;
}

export type TransactionCategoryType = {
    id: string;
    name: string;
    natures: TransactionNatureType[]
}

export type TransactionNatureType = {
    id: string;
    name: string;
}

export type SourceType = {
    id: string;
    name: string;
}

export type AllocationType = {
    id: string;
    name: string;
}