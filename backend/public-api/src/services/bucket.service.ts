import { mongo, connections } from "mongoose";

export class BucketService {
  protected readonly db = connections[0].db;
  protected readonly bucket: mongo.GridFSBucket = new mongo.GridFSBucket(this.db);

  async deleteFilesByName(name: string): Promise<boolean> {
    const fileList = await this.bucket.find({ filename: name }).toArray();

    for (const file of fileList) {
      await this.bucket.delete(file._id);
    }

    return true;
  }

  async uploadFile(filename: string, file: unknown, contentType?: string): Promise<string | undefined> {

    await this.deleteFilesByName(filename);

    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, { contentType });
      uploadStream.write(JSON.stringify(file), "utf8");
      uploadStream.end((error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result) {
            resolve(String(result._id as unknown));
          }
          else {
            resolve(undefined);
          }
        }
      });
    });
  }

  downloadFile(id: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const downloadStream = this.bucket.openDownloadStream(id as unknown as mongo.ObjectId);
      let file = "";
      downloadStream.on("data", (chunk) => {
        file += chunk.toString();
      });
      downloadStream.on("error", (error) => {
        reject(error);
      });
      downloadStream.on("end", () => {
        resolve(JSON.parse(file));
      });
    });
  }
}