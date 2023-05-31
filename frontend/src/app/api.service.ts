import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Datafile } from '../../../common/types/datafile';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private backendUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getData(){
    return this.http.get(this.backendUrl + '/datafiles')
  }

  uploadData(data: Datafile){
    return this.http.post(this.backendUrl + '/datafiles', data)
  }
}
