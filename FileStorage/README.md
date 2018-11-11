# razor-fileupload
This package wraps up logic required to work with uploading and downloading of files to the nodejs server. The package supports saving files to the local file system or to S3

## How to use the package
1. Create a new Express service and add a new route that will accept the files embedded in the request. 
2. Install the npm package: 
    ```
    npm install razor-fileupload --save
    ```
3. Add an import inside the router class:
    ```
    import {FileUploadManager,PersistTypes} from "razor-fileupload";
    ```
4. Create a new instance of the file upload manager:
    ```
    let manager = new FileUploadManager();
    ```
## Uploading a file or list of files

Use the 'FileUploadManager.uploadFiles' method to upload the files

There are minor differences in the __uploadFiles__ methods when saving to the local files system vs saving to S3

#### Upload to the local file system
When saving to the local file system the following params are required inside the __uploadFiles__ method:
1. req - The Express request containing the embedded files
2. persistType - use the PersistType enum for selecting __PersistTypes.fileSystem__
3. dest folder - define the destination folder to save the files
4. fileUrl (optional) - if you would like to access these files directly from the client, you need to pass the url path to the folder (e.g. http://localhost:3000/assests)
> Note that you need to expose the 'assests' folder via express.static in order to access the files : 
app.use("/assests",express.static(clientPath));

#### Upload to S3
In order to use the aws-sdk you are required to supply several environment variables in order to identify your aws account:
1. AWS_ACCESS_KEY_ID
2. AWS_SECRET_ACCESS_KEY
3. AWS_REGION - (e.g. eu-central-1)

> If you do not have these keys then you can go to AWS Console and create them. After logging in to aws console go to 'IAM' service. Select 'Users' and open the 'security credentials' tab. Inside the 'access keys' paragraph you can create a new access key

Since the files are going to be saved in S3 bucket you need to create one or make a new one if one does not already exist. 
> If you want the image files to be accessed directly from S3 using a URL you need to make sure to make the bucket a public one for read

To use the __uploadFiles__ methods for uploading to S3 set the following method params:
1. req - The Express request containing the embedded files
2. persistType - use the PersistType enum for selecting __PersistTypes.s3__
3. bucketName - the name of the bucket to save to
4. fileUrl (optional) - if you would like to access these files directly from the client or browser, you need to pass the url path to the bucket (e.g. https://s3.eu-central-1.amazonaws.com/mycompnay.test.public/)
>Note - if you do not know the full AWS path, go into the AWS console and open the s3 service. Open the bucket and then click a file that you have uploaded. The detailed page will display the link to file at the bottom of the page


The git project contains a full sample of a an Express server that uses the razor-fileupload package. The tester is linked to the package so make sure to use the __npm link__ or if you are not familiar just add the package using npm install.
>NOTE - make sure to set the environment params in file config/.env

## Deleting a file

To delete a file use the 'FileUploadManager.deleteFile' method giving it the unique file name that was created during the file save and the storage location

#### Deleting from local file system
When deleting from local file system the second method param is the folder location of the saved files

#### Deleting from S3
When deleting from S3 the second method param is the name of the bucket
