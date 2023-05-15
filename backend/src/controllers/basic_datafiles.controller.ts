import {
    Body,
    Controller,
    Delete,
    Get,
    Path,
    Post,
    Put,
    Res,
    Route,
    SuccessResponse,
    TsoaResponse,
  } from "tsoa";

  import { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../interfaces/entities/basic_datafile.entity";
  import { BasicDatafileService } from "../services/basic_datafile.service";
  
  export type BasicDatafileCreateRequest = Pick<BasicDatafile, "title" | "description">;

  @Route("datafiles")
  export class BasicDatafileController extends Controller {
    private basicDatafileService = new BasicDatafileService();

    /**
     * Retrieves the list of an existing files.
     */
    @Get()
    public async getAllDataFiles(): Promise<BasicDatafile[]> {
      return this.basicDatafileService.getAll();
    }

    /**
     * Retrieves the details of an existing file.
     * Supply the unique file ID and receive corresponding file details.
     * @param fileId The file's identifier
     */
    @Get("{fileId}")
    public async getDatafile(
      @Path() fileId: string,
      @Res() notFoundResponse: TsoaResponse<404, { reason: string }>
    ): Promise<BasicDatafile> {
      const file = await this.basicDatafileService.get(fileId);

      if(!file) {
        return notFoundResponse(404, { reason: `Not found file with id ${fileId} ` });
      }

      return file;
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
      return this.basicDatafileService.create(body);;
    }

    /**
     * Deletes a file.
     */
    @Delete("{fileId}")
    public async deleteDatafile(
      @Path() fileId: string
    ): Promise<void> {
      return this.basicDatafileService.delete(fileId);;
    }

    /**
     * Update a file.
     */
    @Put("{fileId}")
    public async updateDatafile(
      @Path() fileId: string,
      @Body() body: BasicDatafileUpdateParams
    ): Promise<void> {
      return this.basicDatafileService.update(fileId, body);;
    }
  }