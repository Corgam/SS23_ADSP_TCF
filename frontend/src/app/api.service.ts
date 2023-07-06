import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, concatMap, map } from 'rxjs';
import { FilterSet, PaginationResult, SupportedDatasetFileTypes, SupportedRawFileTypes } from '../../../common/types';
import { Datafile } from '../../../common/types/datafile';
import config from '../config/config';

const { BE_HOST, BE_PORT } = config;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private backendUrl = `http://${BE_HOST}:${BE_PORT}/api`;

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

  createDatafile(data: Datafile) : Observable<Datafile>{
    return this.http.post<Datafile>(this.backendUrl + '/datafile', data);
  }

  attachFile(documentId: string, formData: FormData){
    return this.http.post<Datafile>(this.backendUrl + `/datafile/${documentId}/attach`, formData);
  }

  createDatafileWithFile(data: Datafile, file: File, fileType: SupportedRawFileTypes): Observable<any> {
    return this.createDatafile(data).pipe(concatMap(result => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      return this.attachFile(result._id!, formData);
    }));
  }

  createDatasetFromFile(file: File, datasetType: SupportedDatasetFileTypes, tags?: string[], description?: string){
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset', datasetType);

    if(tags != null && tags.length > 0){
      formData.append('tags ', tags.join(","));
    }

    if(description != null){
      formData.append('description ', description);
    }
    return this.http.post<Datafile>(this.backendUrl + "/datafile/fromFile", formData);
  }

  updateDatafile(id: string, data: Datafile) {
    console.log("asd")
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
