import { Readable } from "stream";
import { PersistFactory } from "../persist/PersistFactory";
import { PersistTypes } from "../dataModels/persistTypes";
export class FileDownloadManager{
    getFile = async (persistType:PersistTypes|string,fileId: any,fileLocation:string): Promise<{fileName:string,stream}> => {
        //get file metadata from db
        //use the persist class to get the stream to the file. Works for s3 and file system
        let ipersist = new PersistFactory().createPersist(persistType);
        let stream = await ipersist.downloadFile(fileId,fileLocation);//get stream and file name
        return {fileName:fileId,stream}
    }
}