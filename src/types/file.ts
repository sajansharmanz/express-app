export type File = {
    originalname: string;
    encoding?: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};
