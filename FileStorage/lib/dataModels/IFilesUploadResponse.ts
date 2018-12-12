import { IFileMetadata } from "./IFileMetadata";

export type IFilesUploadResponse={
    files:IFileMetadata[],
    reqestMetadata:any
}