export type QueryResponse = {
    message?: string;
    [key: string]: any;
};

export type RequestResponse<T> = {
    message: string;
    state: "error" | "success";
    data?: T;
    nextCursor: string;
};

