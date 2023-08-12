import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, concatMap, map } from 'rxjs';
import {
  FilterSet,
  Journey,
  PaginationResult,
  SupportedDatasetFileTypes,
  SupportedRawFileTypes,
} from '../../../../../common/types';
import { Datafile } from '../../../../../common/types/datafile';
import { environment } from '../../../environments/environment';

const { expressBackendHost, expressBackendPort } = environment;

/**
 * Service, which contains all API calls to the backend.
 * Refer to the swagger documentation for the detailed description of all endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //customizable on deployment
  private backendUrl = `http://${expressBackendHost}:${expressBackendPort}/api`;

  constructor(private http: HttpClient) {}

  getDatafiles(limit: number, skip: number, onlyMetadata = false) {
    return this.http.get<PaginationResult<Datafile>>(
      this.backendUrl +
        `/datafile/limit=${limit}&skip=${skip}&onlyMetadata=${onlyMetadata}`
    );
  }

  filterDatafiles(
    filter: FilterSet,
    limit: number,
    skip: number,
    onlyMetadata = false
  ) {
    return this.http.post<PaginationResult<Datafile>>(
      this.backendUrl +
        `/datafile/filter/limit=${limit}&skip=${skip}&onlyMetadata=${onlyMetadata}`,
      filter
    );
  }

  getJourneys(limit: number, skip: number) {
    return this.http.get<PaginationResult<Journey>>(this.backendUrl + `/journey/limit=${limit}&skip=${skip}`);
  }

  filterJourneys(filter: FilterSet, limit: number, skip: number) {
    return this.http.post<PaginationResult<Journey>>(
      this.backendUrl + `/journey/filter/limit=${limit}&skip=${skip}`,
      filter
    );
  }

  deleteJourney(id: string) {
    return this.http.delete(this.backendUrl + '/journey/' + id);
  }

  getDatafile(fileId: string) {
    return this.http.get<Datafile>(this.backendUrl + '/datafile/' + fileId);
  }

  createDatafile(data: Datafile): Observable<Datafile> {
    return this.http.post<Datafile>(this.backendUrl + '/datafile', data);
  }

  attachFile(documentId: string, formData: FormData) {
    return this.http.post<Datafile>(
      this.backendUrl + `/datafile/${documentId}/attach`,
      formData
    );
  }

  createDatafileWithFile(
    data: Datafile,
    file: File,
    fileType: SupportedRawFileTypes
  ): Observable<any> {
    return this.createDatafile(data).pipe(
      concatMap((result) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        return this.attachFile(result._id!, formData);
      })
    );
  }

  createDatasetFromFile(
    file: File,
    datasetType: SupportedDatasetFileTypes,
    tags?: string[],
    description?: string,
    steps?: number
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset', datasetType);

    if (tags != null && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    if (description != null) {
      formData.append('description', description);
    }

    if (datasetType === SupportedDatasetFileTypes.CERV2 && steps) {
      formData.append('steps', steps.toString());
    }

    return this.http.post<Datafile>(
      this.backendUrl + '/datafile/fromFile',
      formData
    );
  }

  updateDatafile(id: string, data: Datafile) {
    return this.http.put(this.backendUrl + '/datafile/' + id, data);
  }

  deleteDatafile(id: string) {
    return this.http.delete(this.backendUrl + '/datafile/' + id);
  }

  /**
   * Returns the coordinates of a given address, if a match is found
   * @param address the address to search for
   * @returns coordintes, if an address could be found, else null
   */
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

  /**
   * Returns the address of the given coordinates
   * @param coordinates the coordinates to search at for the address
   * @returns the address if found, else null
   */
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

  getJourney(id: string) {
    return this.http.get<Journey>(this.backendUrl + '/journey/' + id);
  }

  updateJourney(journey: Journey) {
    const j = JSON.parse(JSON.stringify(journey));
    delete j._id;
    delete j.createdAt;
    delete j.updatedAt;
    delete j.__v;
    return this.http.put<Journey>(
      this.backendUrl + '/journey/' + journey._id,
      j
    );
  }

  createJourney(journey: Journey) {
    return this.http.post<Journey>(this.backendUrl + '/journey', journey);
  }
}
