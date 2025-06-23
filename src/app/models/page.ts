export interface PageInfo {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface Page<T> {
    content: T[];
    page: PageInfo;
}
