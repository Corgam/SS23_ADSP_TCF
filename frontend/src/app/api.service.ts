import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Datafile } from '../../../common/types/datafile';
import { FilterSet } from '../../../common/types';
import { Observable, map } from 'rxjs';
import config from '../config/config';

const { BE_HOST, BE_PORT } = config;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private backendUrl = `http://${BE_HOST}:${BE_PORT}/api`;

  constructor(private http: HttpClient) {}

  getAllDatafiles() {
    return this.http.get<Datafile[]>(
      this.backendUrl + '/datafile/limit=100&skip=0'
    );
  }

  filterDatafiles(filter: FilterSet) {
    return this.http.post<Datafile[]>(
      this.backendUrl + '/datafile/filter/limit=100&skip=0',
      filter
    );
  }

  getDatafiles(fileId: string) {
    return this.http.get<Datafile>(this.backendUrl + '/datafile/' + fileId);
  }

  createDatafile(data: Datafile) {
    return this.http.post(this.backendUrl + '/datafile', data);
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
