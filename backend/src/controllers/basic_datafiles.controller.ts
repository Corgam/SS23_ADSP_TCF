import {
    Body,
    Controller,
    Delete,
    Get,
    Path,
    Post,
    Put,
    Route,
    SuccessResponse,
  } from "tsoa";

  import { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../interfaces/entities/basic_datafile.entity";
  import { BasicDatafileService } from "../services/basic_datafile.service";
  
  export type BasicDatafileCreateRequest = Pick<BasicDatafile, "title" | "description">;

  @Route("datafiles")
  export class BasicDatafileController extends Controller {

    /**
     * Retrieves the list of an existing files.
     */
    @Get()
    public async getAllDataFiles(): Promise<BasicDatafile[]> {
      return new BasicDatafileService().getAll();
    }

    /**
     * Retrieves the details of an existing file.
     * Supply the unique file ID and receive corresponding file details.
     * @param fileId The file's identifier
     */
    @Get("{fileId}")
    public async getDatafile(
      @Path() fileId: string
    ): Promise<BasicDatafile> {
      return new BasicDatafileService().get(fileId);
    }
  
    /**
     * Creates a file.
     */
    @SuccessResponse("201", "Created") // Custom success response
    @Post()
    public async createDatafile(
      @Body() body: BasicDatafileCreateParams
    ): Promise<void> {
      this.setStatus(201); // set return status 201
      return new BasicDatafileService().create(body);;
    }

    /**
     * Deletes a file.
     */
    @Delete("{fileId}")
    public async deleteDatafile(
      @Path() fileId: string
    ): Promise<void> {
      return new BasicDatafileService().delete(fileId);;
    }

    /**
     * Update a file.
     */
    @Put("{fileId}")
    public async updateDatafile(
      @Path() fileId: string,
      @Body() body: BasicDatafileUpdateParams
    ): Promise<void> {
      return new BasicDatafileService().update(fileId, body);;
    }
  }