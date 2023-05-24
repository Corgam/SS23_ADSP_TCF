import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private backendUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getData(){
    return this.http.get(this.backendUrl + '/datafiles')
  }
}