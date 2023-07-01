import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Datafile } from '../../../common/types/datafile';
import { FilterSet } from '../../../common/types';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private backendUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAllDatafiles() {
    return this.http.get<Datafile[]>(this.backendUrl + '/datafile');
  }

  filterDatafiles(filter: FilterSet) {
    return this.http.post<Datafile[]>(
      this.backendUrl + '/datafile/filter',
      filter
    );
  }

  getDatafiles(fileId: string) {
    return this.http.get<Datafile>(this.backendUrl + '/datafile/' + fileId);
  }

  createDatafile(data: Datafile) {
    return this.http.post(this.backendUrl + '/datafile', data);
  }

  createDatafileWithFile(data: Datafile, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    const createDatafile$ = this.http.post(this.backendUrl + '/datafiles', data);
    const uploadFile$ = this.http.post(this.backendUrl + '/upload', formData);
  
    return forkJoin([createDatafile$, uploadFile$]);
  }

  updateDatafile(id: string, data: Datafile) {
    return this.http.put(this.backendUrl + '/datafile/' + id, data);
  }

  deleteDatafile(id: string) {
    return this.http.delete(this.backendUrl + '/datafile/' + id);
  }

  geocodeAddress(address: string): Observable<[number, number] | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    return this.http.get<any[]>(url).pipe(
      map((data: any[]) => {
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

  getAddress(coordinates: string): Observable<string | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      coordinates
    )}`;
    return this.http.get<any[]>(url).pipe(
      map((data: any[]) => {
        if (data.length > 0) {
          const firstResult = data[0];
          return firstResult.display_name;
        }
        return null;
      })
    );
  }
}
