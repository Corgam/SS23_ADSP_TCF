import {
  BasicDatafile,
  BasicDatafileCreateParams,
  BasicDatafileUpdateParams
} from "../interfaces/entities/basic_datafile.entity";
import basic_datafileModel from "../models/basic_datafile.model";
import { BaseService } from "./base.service";

export default class BasicDatafileService extends BaseService<BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams> { 
  constructor() {
    super(basic_datafileModel)
  }
}