// import { Server} from "./server";
// import {config} from "dotenv";
// import * as path from "path"
// let configPath = path.join(__dirname, "./config/.env")
// config({path: configPath});
// const server = new Server();

// server.setRoutes();
// server.setStaticFolders();
// server.setErrorHandlers();
// server.startServer();
import * as request from "superagent"
import * as fs from "fs";

// let fileName="5f5e3b61-f3c8-11e8-a6be-7727834cd3e6_error.JPG";
// request.post("http://localhost:3000/storage/downloadfs").send({fileName}).then(res=>{
//     fs.writeFile("myfile.png", res.body,(err)=>{
//         console.log("Saved file");
//     })
// })
let s3Filename = "17360b81-f2f4-11e8-beda-1379d24da773_7a45baaca653f6654032e2db7a2a8d88.jpg"
request.post("http://localhost:3000/storage/downloads3").send({fileName: s3Filename}).then(res=>{
    fs.writeFile("mys3file.png", res.body,(err)=>{
        console.log("Saved file");
    })
})
