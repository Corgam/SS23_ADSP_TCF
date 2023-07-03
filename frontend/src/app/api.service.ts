import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Datafile } from '../../../common/types/datafile';
import { FilterSet, PaginationResult } from '../../../common/types';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private backendUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getDatafiles(limit: number, skip: number) {
    return this.http.get<PaginationResult<Datafile>>(this.backendUrl + `/datafile/limit=${limit}&skip=${skip}`);
  }

  filterDatafiles(filter: FilterSet, limit: number, skip: number) {
    return this.http.post<PaginationResult<Datafile>>(
      this.backendUrl + `/datafile/filter/limit=${limit}&skip=${skip}`,
      filter
    );
  }

  getDatafile(fileId: string) {
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
