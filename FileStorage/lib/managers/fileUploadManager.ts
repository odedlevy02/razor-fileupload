import { PersistFactory } from "../persist/PersistFactory";
import { IFileMetadata } from "../dataModels/IFileMetadata";
import * as formidable from 'formidable';
import * as uuid from "uuid/v1"
import { PersistTypes } from "../dataModels/persistTypes";
import { IFilesUploadResponse } from "../dataModels/IFilesUploadResponse";
export class FileUploadManager{

    uploadFiles = async (req:Express.Request,persistType:PersistTypes|string,saveToFolderPath:string,linkToFolderUrl?:string):Promise<IFilesUploadResponse>=> {
        let uploadsRes = await this.getFilesListFromRequest(req);
        let ipersist = new PersistFactory().createPersist(persistType);
        try {
            uploadsRes.files = await ipersist.uploadFiles(uploadsRes.files,saveToFolderPath,linkToFolderUrl); //update with file full path
        }catch(err){
            return err
        }
        //Clean data before sending to client
        uploadsRes.files.forEach(file=>{
            delete (<any>file).tempPath;
        })
        return uploadsRes;
    }

    //extract files from req
    private getFilesListFromRequest=(req):Promise<IFilesUploadResponse>=>{
        return new Promise<IFilesUploadResponse>((resolve,reject)=>{
            let form = new formidable.IncomingForm();
            let uploads:IFileMetadata[]=[];
            let data = null;
            form.multiples = true;
            form.on("file", (field, file) => {
                const fileNameParts = file.name.split('.');
                const fileExtenstion = fileNameParts[fileNameParts.length - 1];
                uploads.push(<any>{
                    fileName:  file.name,
                    fileExtension: fileExtenstion,
                    fileUniqueName: this.createFileUniqueName(file.name,fileExtenstion),
                    tempPath:file.path,
                });
            })
            form.on('field', function (name, val) {
                if (name == "data") { //only parse if receved key data
                    try{
                        data = JSON.parse(val)
                    }catch(err){
                        data = {error:"error when parsing data to json",origValue:val}
                    }
                    
                }
            });
            // log any errors that occur
            form.on('error', function (err) {
                console.log('An error has occured when uploading files: \n' + err);
                reject({messge:err.message});
            });
            // once all the files have been uploaded, send a response to the client
            form.on('end',  async ()=> {
                //try to save the file to relevant persistance
                resolve({files:uploads,reqestMetadata:data});
            });
            // parse the incoming request containing the form data
            form.parse(<any>req);
        })
    }

    private createFileUniqueName=(fileName:string,fileExtenstion:string)=>{
        let encodedFileName = encodeURIComponent(fileName);
        let uniqueName =  `${uuid()}`
        //if the file name contains characters that need to be encoded - remove the file name and use only the unique id
        //this is to avoid errors related to linking to a file that has encoded chars
        if(encodedFileName!=fileName){
            uniqueName =  `${uuid()}.${fileExtenstion}`   
        }else{
            uniqueName =  `${uuid()}_${encodedFileName}`
        }
        return uniqueName;
    }

     deleteFile=async (persistType:PersistTypes|string, fileUniqueName:string, storagePath:string):Promise<boolean>=>{
        try {
            let ipersist = new PersistFactory().createPersist(persistType);
            await ipersist.deleteFile(fileUniqueName ,storagePath)
            return true;
        }catch (err){
            throw err;
        }
    }
}

