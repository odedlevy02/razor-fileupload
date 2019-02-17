import * as AWS from 'aws-sdk';
import * as fs from "fs";
import * as stream from "stream"
import * as url from "url";
import { IPersistFile } from "./IPersistFile";
import { IFileMetadata } from '../dataModels/IFileMetadata';

export class S3PersistFile implements IPersistFile {
    
    constructor() {
        AWS.config.update({region: process.env.AWS_REGION});
    }

    async uploadFiles(files: IFileMetadata[],saveToStoragePath:string,linkToStorageUrl?:string,makeImagesPublic:boolean=false): Promise<IFileMetadata[]> {
        for (let file of files) {
            let stream = fs.createReadStream((<any>file).tempPath);
            let isFileImage = this.isImage(file.fileExtension)
            await this.addFileToBucket(file.fileUniqueName,saveToStoragePath,isFileImage, stream,makeImagesPublic);
            //update file location
            if(linkToStorageUrl){
                //if link does not end with '/' the url.resolve will just remove it
                if(!linkToStorageUrl.endsWith("/")){
                    linkToStorageUrl+="/"
                }
                file.fileUrl = url.resolve(linkToStorageUrl,file.fileUniqueName);
            }
        }
        return files;
    }

    addFileToBucket = (fileName: string,bucketName:string,isImage:boolean, fileStream: stream,makeImagesPublic:boolean): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            let putParams = {
                Bucket: bucketName,
                Key: `${fileName}`,
                Body: fileStream
            };
            if (isImage ) {
                if(makeImagesPublic){
                    putParams["ACL"] = 'public-read';
                }
                putParams["ContentType"] =  'image/jpeg';
            }
            let s3 = new AWS.S3();
            s3.putObject(putParams, function (putErr, putData) {
                if (putErr) {
                    console.error(`S3PersistFile.addFileToBucket. Error when trying to add file '${fileName}' to bucket: '${bucketName}'`, putErr);
                    reject(putErr)
                } else {
                    console.log(`S3PersistFile.addFileToBucket: successfuly added file '${fileName}' to bucket: '${bucketName}'`);
                    resolve(putData);
                }
            });
        });

    }

    deleteFile(fileUniqueName: string,bucketName:string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let delParams = {
                Bucket: bucketName,
                Key: fileUniqueName
            }
            new AWS.S3().deleteObject(delParams, (err, data) => {
                if (err) {
                    console.error(`S3PersistFile.deleteFile - error when trying to delete file '${fileUniqueName}' from bucket '${bucketName}'`, err);
                    reject(err);
                } else {
                    console.log(`S3PersistFile.deleteFile: File '${fileUniqueName}' has been deleted from bucket '${bucketName}'`);
                    resolve(true)
                }
            })
        });
    }

    //return a stream from s3
    downloadFile(fileUniqueName:string,bucketName:string):Promise<stream>{
        return new Promise<stream>((resolve, reject) => {
            let getParams = {
                Bucket: bucketName,
                Key: `${fileUniqueName}`
            };
            //before getting an object validate it exists
            new AWS.S3().headObject(getParams, (err, data) => {
                if (err) {
                    console.error(`Download request from S3 for file ${fileUniqueName} failed since file does not exist. Error: ${err.name}`);
                    reject(new Error(`Download request from S3 for file ${fileUniqueName} failed since file does not exist. View logs for details`));
                } else {
                    let stream = new AWS.S3().getObject(getParams).createReadStream()
                    resolve(stream);
                }
            })
        });
    }

    private isImage(extension: string): boolean {
        return this.imagesExt.includes(extension.toLowerCase());
    }

    private imagesExt=["png","jpg","jpeg"]

}