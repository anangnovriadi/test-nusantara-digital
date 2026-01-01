export interface ApiResponse<T> {
    data: T | any;
    message: string;
    info: string;
    total: number;
    currentPage: number;
    totalPages: number;
}
