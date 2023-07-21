import { BucketService } from "./bucket.service";

export default class NetCDFJsonBucketService extends BucketService {
  protected readonly fileExtension = ".netcdf.json";

  constructor() {
    super("netcdf");
  }

  override async uploadFile(documentId: string, file: unknown): Promise<string | undefined> {
    return await super.uploadFile(documentId + this.fileExtension, file, "application/json");
  }

  override async downloadFile(documentId: string): Promise<unknown> {
    return await super.downloadFile(documentId + this.fileExtension);
  }
}