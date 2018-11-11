import { IPersistFile } from "./IPersistFile";
import { FileSystemPersistFile } from "./FileSystemPersistFile";
import { S3PersistFile } from "./S3PersistFile";

export class PersistFactory{
    createPersist=(persistType):IPersistFile=>{
        switch(persistType){
            case "fileSystem":
                return new FileSystemPersistFile();
            case "s3":
                return new S3PersistFile()
            default:
                throw new Error(`Persist type ${persistType} is not supported`);
        }
    }

}