import {
    Body,
    Controller,
    Get,
    Path,
    Post,
    Route,
    SuccessResponse,
  } from "tsoa";

  import { BasicDatafile } from "../interfaces/basic_datafile.interface";
  import { BasicDatafileService, BasicDatafileCreationParams } from "../services/basic_datafile.service";
  
  @Route("datafiles")
  export class BasicDatafileController extends Controller {
    @Get()
    public async getAllDataFiles(): Promise<BasicDatafile[]> {
      return new BasicDatafileService().getAll();
    }

    @Get("{fileId}")
    public async getDatafile(
      @Path() fileId: string
    ): Promise<BasicDatafile> {
      return new BasicDatafileService().get(fileId);
    }
  
    @SuccessResponse("201", "Created") // Custom success response
    @Post()
    public async createUser(
      @Body() requestBody: BasicDatafileCreationParams
    ): Promise<void> {
      this.setStatus(201); // set return status 201
      new BasicDatafileService().create(requestBody);
      return;
    }
  }