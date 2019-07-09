import * as stream from "stream";
import { IFileMetadata } from "../dataModels/IFIleMetadata";
export interface IPersistFile{
    uploadFiles(files:IFileMetadata[],saveToStoragePath:string,linkToStorageUrl?:string,makePublic?:boolean):Promise<IFileMetadata[]>;
    deleteFile(fileUniqueName:string ,storagePath:string):Promise<any>;
    //this will be called when requesting to download a file. The result is the path to the local file system
    downloadFile(fileUniqueName:string,storagePath:string):Promise<stream>
}
