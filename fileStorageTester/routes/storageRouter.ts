import {Router} from "express";
import * as express from "express";
import {FileUploadManager,PersistTypes} from "razor-fileupload";

class StorageRouter{

  router: Router;

  constructor() {
    this.router = express.Router();
    this.createRoutes();
  }

  private createRoutes() {
    this.router.post("/uploadfs", this.uploadfs);
    this.router.post("/deletefs", this.deletefs);
    this.router.post("/uploads3", this.uploads3);
    this.router.post("/deletes3", this.deletes3);
  }

  uploadfs=(req,res,next)=>{
    let manager = new FileUploadManager();
    manager.uploadFiles(req,PersistTypes.fileSystem,"./assests","http://localhost:3000/assests").then(filesRes=>{
      res.status(200).send(filesRes)
    }).catch(err=>{
      res.status(500).send(err.message);
    })
    
  }

  deletefs=(req,res)=>{
    let fileName = req.body.fileName;
    let manager = new FileUploadManager();
    manager.deleteFile(PersistTypes.fileSystem,fileName,"./assests").then(filesRes=>{
      res.status(200).send({succeeded:filesRes})
    }).catch(err=>{
      res.status(500).send(err.message);
    })
  }

  uploads3=(req,res,next)=>{
    let manager = new FileUploadManager();
    let bucketName = process.env.S3_BUCKET_NAME;
    manager.uploadFiles(req,PersistTypes.s3,bucketName,"https://s3.eu-central-1.amazonaws.com/razor.test.public/").then(filesRes=>{
      res.status(200).send(filesRes)
    }).catch(err=>{
      res.status(500).send(err.message);
    })
    
  }

  deletes3=(req,res)=>{
    let fileName = req.body.fileName;
    let manager = new FileUploadManager();
    let bucketName = process.env.S3_BUCKET_NAME;
    manager.deleteFile(PersistTypes.s3,fileName,bucketName).then(filesRes=>{
      res.status(200).send({succeeded:filesRes})
    }).catch(err=>{
      res.status(500).send(err.message);
    })
  }
}

export const storageRouter= new StorageRouter().router;
//Note - add to server.ts method setRoutes:  this.app.use("/storage",storageRouter);
