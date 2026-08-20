export interface ServiceResponse<T> {
    success: boolean,
    data: T,
    statusCode: number,
    errors: any
}