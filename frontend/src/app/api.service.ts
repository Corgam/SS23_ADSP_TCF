import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private backendUrl = 'http://localhost:8080'
  constructor(private http: HttpClient) { }

  uploadData(data: unknown){
    return this.http.get(this.backendUrl + '/datafiles')
  }
}
