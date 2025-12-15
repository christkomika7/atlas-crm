export type QueryResponse = {
    message?: string;
    [key: string]: any;
};

export type RequestResponse<T> = {
    message: string;
    total: number;
    state: "error" | "success";
    data?: T;
    all?: T;
    nextCursor: string;
};

