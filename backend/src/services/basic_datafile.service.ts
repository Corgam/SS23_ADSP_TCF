
import basic_datafileModel, { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../models/basic_datafile.model";
import { BaseService } from "./base.service";

export default class BasicDatafileService extends BaseService<BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams> { 
  constructor() {
    super(basic_datafileModel)
  }
}