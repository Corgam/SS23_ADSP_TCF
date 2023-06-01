import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Datafile } from '../../../common/types/datafile';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private backendUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getAllDatafiles(){
    return this.http.get<Datafile[]>(this.backendUrl + '/datafiles')
  }

  getDatafiles(fileId: string){
    return this.http.get<Datafile>(this.backendUrl + '/datafiles/' + fileId)
  }

  createDatafile(data: Datafile){
    return this.http.post(this.backendUrl + '/datafiles', data)
  }

  updateDatafile(id: string, data: Datafile){
    return this.http.put(this.backendUrl + '/datafiles/' + id, data)
  }

  deleteDatafile(id: string,){
    return this.http.delete(this.backendUrl + '/datafiles/' + id)
  }
}
