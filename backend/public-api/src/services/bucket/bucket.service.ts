import { mongo, connections } from "mongoose";

/**
 * A service for managing file operations using GridFSBucket.
 */
export abstract class BucketService {
  protected readonly db = connections[0].db; // MongoDB database connection
  protected bucket: mongo.GridFSBucket; // GridFSBucket instance for file operations

  constructor(bucketName = "default") {
    this.bucket = new mongo.GridFSBucket(this.db, { bucketName: bucketName });
  }

  /**
   * Deletes files with a given name from the GridFSBucket.
   * @param name - The name of the files to delete.
   * @returns A Promise that resolves to true when all files are deleted successfully.
   */
  async deleteFilesByName(name: string): Promise<boolean> {
    const fileList = await this.bucket.find({ filename: name }).toArray(); // Find files with a specific name

    for (const file of fileList) {
      await this.bucket.delete(file._id); // Delete each file by its ObjectId
    }

    return true; // Return true when all files are deleted
  }

  /**
   * Uploads a file to the GridFSBucket.
   * If a file with the same name already exists, it is deleted before uploading the new file.
   * @param filename - The name of the file to upload.
   * @param file - The file content to upload.
   * @param contentType - The MIME type of the file.
   * @returns A Promise that resolves to the ObjectId of the uploaded file, or undefined if the upload fails.
   */
  async uploadFile(
    filename: string,
    file: unknown,
    contentType?: string
  ): Promise<string | undefined> {
    await this.deleteFilesByName(filename); // Delete existing files with the same name

    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        contentType,
      }); // Create an upload stream for the new file
      uploadStream.write(JSON.stringify(file), "utf8"); // Write the file content to the upload stream
      uploadStream.end((error, result) => {
        if (error) {
          reject(error); // Reject the Promise if an error occurs during the upload
        } else {
          if (result) {
            console.log("Result ", result);
            console.log("ResultId ", result._id);
            resolve(String(result._id as unknown)); // Resolve the Promise with the ObjectId of the uploaded file
          } else {
            resolve(undefined); // Resolve the Promise with undefined if the upload result is missing
          }
        }
      });
    });
  }

  /**
   * Downloads a file from the GridFSBucket by its ObjectId.
   * @param filename - The name of the file to download.
   * @returns A Promise that resolves to the parsed content of the downloaded file.
   */
  downloadFile(filename: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const downloadStream = this.bucket.openDownloadStreamByName(filename); // Create a download stream for the file
      let file = "";
      downloadStream.on("data", (chunk) => {
        file += chunk.toString(); // Concatenate the chunks of data into a string
      });
      downloadStream.on("error", (error) => {
        reject(error); // Reject the Promise if an error occurs during the download
      });
      downloadStream.on("end", () => {
        resolve(JSON.parse(file)); // Resolve the Promise with the parsed content of the downloaded file
      });
    });
  }
}
