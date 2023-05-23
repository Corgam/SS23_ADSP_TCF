import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private backendUrl = 'localhost:8080';

  constructor(private http: HttpClient) { }

  getData(){
    return this.http.get(this.backendUrl + '/datafiles')
  }
}