
import basic_datafileModel, { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../models/basicDatafile.model";
import { BaseService } from "./base.service";

export default class BasicDatafileService extends BaseService<BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams> { 
  constructor() {
    super(basic_datafileModel)
  }
}