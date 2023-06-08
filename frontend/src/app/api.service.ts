import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Datafile } from '../../../common/types/datafile';
import { map } from 'rxjs';

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

  geocodeAddress(address: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    return this.http.get<any[]>(url).pipe(
      map((data: string | any[]) => {
        if (data.length > 0) {
          const firstResult = data[0];
          const longitude = parseFloat(firstResult.lon);
          const latitude = parseFloat(firstResult.lat);
          return [longitude, latitude] as [number, number];
        }
        return null;
      })
    );
  }
}
