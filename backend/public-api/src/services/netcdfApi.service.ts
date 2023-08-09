/**
 * NetcdfApi is a utility class that provides methods for interacting with a remote service
 * to process NetCDF files and retrieve metadata and data chunks.
 */
import axios from "axios";
import config from "../config/config";
import { FailedToParseError } from "../errors";

export default abstract class NetcdfApi {
  /**
   * The base URL for the NetCDF processing endpoint.
   */
  static readonly netCdf_endpoint =
    config.DATASCIENCE_BASE_URL + "/convert-netcdf-to-json";

  /**
   * Retrieves metadata for a given NetCDF file.
   *
   * @param netCDFFile - The NetCDF file to extract metadata from.
   * @returns A Promise that resolves to the extracted metadata.
   * @throws FailedToParseError if there's an issue parsing the NetCDF file or processing the request.
   */
  static async getMetaData(netCDFFile: Express.Multer.File): Promise<any> {
    try {
      const url = this.netCdf_endpoint + "/metadata";

      // Create form data
      const formData = new FormData();
      const blob = new Blob([netCDFFile.buffer], { type: netCDFFile.mimetype });
      formData.append("file", blob, netCDFFile.originalname);

      // Post form data and receive response stream
      const response = await axios.post(url, formData, {
        responseType: "stream",
      });

      // Handle response stream
      const chunks: string[] = [];
      for await (const chunk of response.data) {
        chunks.push(chunk);
      }

      return JSON.parse(chunks.join(""));
    } catch (error) {
      throw new FailedToParseError(
        `Failed to parse the provided NetCDF file. ${error}`
      );
    }
  }

  /**
   * Retrieves data from a given NetCDF file.
   *
   * @param file - The NetCDF file to retrieve data from.
   * @returns A Promise that resolves to the retrieved data.
   * @throws FailedToParseError if there's an issue parsing the NetCDF file or processing the request.
   */
  static async getFileData(file: Express.Multer.File): Promise<any> {
    try {
      const url = this.netCdf_endpoint + "/data";

      // Create form data
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append("file", blob, file.originalname);

      // Post form data and receive response stream
      const response = await axios.post(url, formData, {
        responseType: "stream",
      });

      // Handle response stream
      const chunks: string[] = [];
      for await (const chunk of response.data) {
        chunks.push(chunk);
      }

      return JSON.parse(chunks.join(""));
    } catch (error) {
      throw new FailedToParseError(
        `Failed to parse the provided NetCDF file. ${error}`
      );
    }
  }

  /**
   * Retrieves data chunks from a NetCDF file using CERv2 format.
   *
   * @param file - The NetCDF file to retrieve data chunks from.
   * @param options - Additional options for filtering and chunk size.
   * @returns An AsyncGenerator that yields individual data chunks.
   * @throws FailedToParseError if there's an issue parsing the NetCDF file or processing the request.
   */
  static async *getCERv2DataChunks(
    file: Express.Multer.File,
    options?: { filter?: string[]; stepSize?: number }
  ): AsyncGenerator<any, any, any> {
    try {
      const url = this.netCdf_endpoint + "/cerv2-data-chunks";

      // Create form data
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append("file", blob, file.originalname);
      if (options?.filter) {
        formData.append("filter_variables", options.filter.join(","));
      }
      if (options?.stepSize) {
        formData.append("step_size", JSON.stringify(options.stepSize));
      }

      // Post form data and receive response stream
      const response = await axios.post(url, formData, {
        responseType: "stream",
      });

      // Handle response stream
      let jsonData = "";
      for await (const chunk of response.data) {
        jsonData += chunk;
        const lines = jsonData.split("||*split*||");
        // Process all lines except the last one
        for (let i = 0; i < lines.length - 1; i++) {
          yield JSON.parse(lines[i]);
        }
        // Keep the last line for the next chunk
        jsonData = lines[lines.length - 1];
      }

      // Process the remaining JSON line if it exists
      if (jsonData.trim() !== "") {
        yield JSON.parse(jsonData);
      }
    } catch (error) {
      console.log(error);
      throw new FailedToParseError("Failed to parse the provided NetCDF file.");
    }
  }
}
