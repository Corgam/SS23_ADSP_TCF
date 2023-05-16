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
    Response,
    SuccessResponse,
    TsoaResponse,
  } from "tsoa";

  import { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../interfaces/entities/basic_datafile.entity";
  import { BasicDatafileService } from "../services/basic_datafile.service";
  import NotFoundError from "../errors/NotFound.error";

  /**
   * @pattern [0-9A-Fa-f]{24}
   * @example "646365496740ded7a396f5d0"
   */
  export type MongoDBObjectId = string;

  @Route("datafiles")
  export class BasicDatafileController extends Controller {
    private readonly basicDatafileService = new BasicDatafileService();

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
    @Response<NotFoundError>(404, "Not found")
    public async getDatafile(
      @Path() fileId: MongoDBObjectId,
    ): Promise<BasicDatafile> {
      return this.basicDatafileService.get(fileId);
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
      return this.basicDatafileService.create(body);
    }

    /**
     * Deletes a file.
     */
    @Delete("{fileId}")
    @Response<NotFoundError>(404, "Not found")
    public async deleteDatafile(
      @Path() fileId: MongoDBObjectId,
    ): Promise<void> {
      this.basicDatafileService.delete(fileId);
      return;
    }

    /**
     * Update a file.
     */
    @Put("{fileId}")
    @Response<NotFoundError>(404, "Not found")
    public async updateDatafile(
      @Path() fileId: MongoDBObjectId,
      @Body() body: BasicDatafileUpdateParams,
      @Res() notFoundResponse: TsoaResponse<404, { reason: string }>
    ): Promise<void> {
      this.basicDatafileService.update(fileId, body);
      return;
    }
  }