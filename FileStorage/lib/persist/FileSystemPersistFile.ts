import { Readable } from "stream";
import { IPersistFile } from "./IPersistFile";
import * as path from "path";
import * as fs from "fs";
import * as url from "url";
import { IFileMetadata } from "../dataModels/IFIleMetadata";
export class FileSystemPersistFile implements IPersistFile {

    constructor() {
    }

    uploadFiles = async (files: IFileMetadata[], saveToFolderPath: string, linkToFolderUrl?: string): Promise<IFileMetadata[]> => {
        this.validateFolderExists(saveToFolderPath);
        //iterate over files and save each one
        for (let file of files) {
            let fullPath = path.join(saveToFolderPath, file.fileUniqueName);

            //set the file url inside the result metadata
            if (linkToFolderUrl) {
                //if link does not end with '/' the url.resolve will just remove it
                if (!linkToFolderUrl.endsWith("/")) {
                    linkToFolderUrl += "/"
                }
                file.fileUrl = url.resolve(linkToFolderUrl, file.fileUniqueName);
            }
            try {
                await this.moveFile((<any>file).tempPath, fullPath)
            } catch (err) {
                (<any>file).error = err.message;
            }

        }
        return files
    }

    private moveFile = (orig: string, dest: string): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            fs.copyFile(orig, dest, (err => {
                if (!err) {
                    fs.unlink(orig, (err => {  //delete temp file
                        resolve(true);
                    }));
                } else { //if there is error send it inside the file metadata
                    reject(err);
                }
            }));
        })

    }


    deleteFile(fileUniqueName: string, folderPath: string): Promise<any> {
        return new Promise<boolean>((resolve, reject) => {
            let fullPath = path.join(folderPath, fileUniqueName);
            if (fs.existsSync(fullPath)) {
                fs.unlink(fullPath, (err) => {
                    if (err) {
                        reject(err.message);
                    } else {
                        resolve(true)
                    }

                });
            } else { //if file does not exist assume that it has already been deleted. Log and return true (same as s3)
                console.warn(`FileSystemPersistFile.deleteFile - warning. Request to delete file '${fileUniqueName}' from folder: ${folderPath} yet path does not exist. Assuming file already deleted`);
                resolve(true);
            }
        })
    }

    downloadFile(file: IFileMetadata, folderPath: string): Promise<Readable> {
        let fullPath = path.join(folderPath, file.fileUniqueName);
        if (fs.existsSync(fullPath)) {
            return Promise.resolve(fs.createReadStream(fullPath))
        } else {
            console.error(`Error when trying to download file ${file.fileUniqueName} from file system. File does not exist`);
            return Promise.reject(new Error("Error when trying to download file from file system. View logs for details"))
        }

    }

    validateFolderExists = (fullPath: string) => {
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath);
        }
    }


}