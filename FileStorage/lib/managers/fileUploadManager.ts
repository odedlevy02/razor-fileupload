import { PersistFactory } from "../persist/PersistFactory";
import { IFileMetadata } from "../dataModels/IFileMetadata";
import * as formidable from 'formidable';
import * as uuid from "uuid/v1"
import { PersistTypes } from "../dataModels/persistTypes";

export class FileUploadManager{

    uploadFiles = async (req:Express.Request,persistType:PersistTypes|string,saveToFolderPath:string,linkToFolderUrl?:string):Promise<IFileMetadata[]>=> {
        let uploads = await this.getFilesListFromRequest(req);
        let ipersist = new PersistFactory().createPersist(persistType);
        try {
            uploads = await ipersist.uploadFiles(uploads,saveToFolderPath,linkToFolderUrl); //update with file full path
        }catch(err){
            return err
        }
        //Clean data before sending to client
        uploads.forEach(file=>{
            delete (<any>file).tempPath;
        })
        return uploads;
    }

    //extract files from req
    private getFilesListFromRequest=(req):Promise<IFileMetadata[]>=>{
        return new Promise<IFileMetadata[]>((resolve,reject)=>{
            let form = new formidable.IncomingForm();
            let uploads:IFileMetadata[]=[];
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
            // log any errors that occur
            form.on('error', function (err) {
                console.log('An error has occured when uploading files: \n' + err);
                reject({messge:err.message});
            });
            // once all the files have been uploaded, send a response to the client
            form.on('end',  async ()=> {
                //try to save the file to relevant persistance
                resolve(uploads);
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