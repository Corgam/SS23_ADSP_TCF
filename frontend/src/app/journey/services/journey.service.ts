import { Injectable } from '@angular/core';
import {
  AreaFilter,
  BooleanOperation,
  Collection,
  Datafile,
  FilterOperations,
  Journey,
  PaginationResult,
  RadiusFilter,
  Visibility,
} from '@common/types';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  filter,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { colors } from '../../../util/colors';
import { isMapFilter } from '../../../util/filter-utils';
import { hashObj } from '../../../util/hash';
import { ApiService } from '../../shared/service/api.service';
import { DownloadService } from '../../download.service';

export interface CollectionData {
  collection: Collection;
  files: PaginationResult<Datafile>;
  color: string; // hex string
  selectedFilesIds: Set<string>;
}

@Injectable({
  providedIn: 'root',
})
export class JourneyService {
  private journeySubject = new BehaviorSubject<Journey | null>(null);
  journey$ = this.journeySubject.asObservable();

  private selectedDataFilesSubject = new BehaviorSubject<Set<string>>(
    new Set()
  );
  selectedDataFiles$ = this.selectedDataFilesSubject.asObservable();

  private selectedCollectionSubject = new BehaviorSubject<Collection | null>(
    null
  );
  selectedCollection$ = this.selectedCollectionSubject.asObservable();

  collectionsData$: Observable<CollectionData[]> = this.journey$.pipe(
    switchMap((journey) => {
      console.log(journey);
      if (journey == null || journey.collections.length == 0) return of([]);
      return forkJoin(
        journey.collections.map((collection, i) =>
          this.getCollection(collection).pipe(
            map(
              (dataFiles) =>
                ({
                  collection: collection,
                  files: dataFiles,
                  color: colors[i],
                  selectedFilesIds: new Set(),
                } as CollectionData)
            )
          )
        )
      );
    }),
    switchMap((collectionsData) =>
      combineLatest([of(collectionsData), this.selectedDataFiles$])
    ),
    map(([collectionsData, selectedDataFiles]) => {
      const df = [...selectedDataFiles];
      for (let collectionData of collectionsData) {
        collectionData.selectedFilesIds = new Set(
          df.filter(
            (id) =>
              collectionData.files.results.find((file) => file._id == id) !=
              null
          )
        );
      }
      return collectionsData;
    }),
    shareReplay(1)
  );

  constructor(
    private apiService: ApiService,
    private downloadService: DownloadService
  ) {}

  loadJourney(id: string | null) {
    const journeyMock: Journey = {
      title: 'New Journey',
      description: 'this is a description',
      tags: ['one tag', 'second tag'],
      author: 'me',
      collections: [],
      visibility: Visibility.PUBLIC,
    };

    if (id == null)
      of(journeyMock).subscribe((val) => this.journeySubject.next(val));
    else
      this.apiService
        .getJourney(id)
        .subscribe((val) => this.journeySubject.next(val));

    this.journey$
      .pipe(
        filter((journey) => journey != null),
        map((journey) => journey!.collections[0])
      )
      .subscribe((val) => this.selectedCollectionSubject.next(val));

    this.collectionsData$
      .pipe(
        filter((val) => val.length != 0),
        take(1)
      )
      .subscribe((collectionsData) => {
        for (let collectionData of collectionsData)
          this.selectDataFiles(...collectionData.files.results);
      });
  }

  reloadJourney() {
    this.journeySubject.next(this.journeySubject.value);
  }

  saveJourney() {
    const journey = this.journeySubject.value;
    console.log(journey);
    let savedJourney: Observable<Journey>;
    if (journey == null) throw new Error('there is no journey to save');

    const j = JSON.parse(JSON.stringify(journey));
    delete j._id;
    delete j.createdAt;
    delete j.updatedAt;
    delete j.__v;

    savedJourney = this.apiService.createJourney(j).pipe(shareReplay(1));
    savedJourney.subscribe((journey) => this.journeySubject.next(journey));
    return savedJourney;
  }

  downloadSelectedData() {
    this.collectionsData$
      .pipe(
        take(1),
        switchMap((collectionsData) => {
          return forkJoin(
            collectionsData.map((data) => {
              let ids = [...data.selectedFilesIds];
              return this.apiService.filterDatafiles(
                {
                  filterSet: [
                    {
                      booleanOperation: BooleanOperation.OR,
                      filters: ids.map((id) => ({
                        key: '_id',
                        operation: FilterOperations.MATCHES,
                        negate: false,
                        value: id,
                      })),
                    },
                  ],
                },
                ids.length,
                0,
                false
              );
            })
          );
        })
      )
      .subscribe((results) => {
        let file = results.map((result) => result.results);
        this.downloadService.download(file, 'JourneyResult');
      });
  }

  addCollection() {
    const journey = this.journeySubject.value;
    journey?.collections.push({
      title: 'new Collection',
      filterSet: [],
    });
    this.journeySubject.next(journey);
  }

  selectCollection(collection: Collection) {
    this.selectedCollectionSubject.next(collection);
  }

  deleteCollection(collection: Collection) {
    const journey = this.journeySubject.value!;
    const index = journey.collections.findIndex((col) => col == collection);
    journey.collections.splice(index, 1);
    this.journeySubject.next(journey);
  }

  getCollection(
    collection: Collection
  ): Observable<PaginationResult<Datafile>> {
    if (collection.filterSet.length == 0)
      return of({
        skip: 0,
        limit: 500,
        totalCount: 0,
        results: [],
      });
    return this.apiService.filterDatafiles(
      { filterSet: collection.filterSet },
      500,
      0,
      true
    );
  }

  selectDataFiles(...dataFiles: Datafile[]) {
    const selected = this.selectedDataFilesSubject.value;
    for (let dataFile of dataFiles) selected.add(dataFile._id!);

    this.selectedDataFilesSubject.next(selected);
  }

  deselectDataFiles(...dataFiles: Datafile[]) {
    const selected = this.selectedDataFilesSubject.value;
    for (let dataFile of dataFiles) selected.delete(dataFile._id!);

    this.selectedDataFilesSubject.next(selected);
  }

  isOneSelected$(...ids: string[]) {
    return this.selectedDataFiles$.pipe(
      map(
        (selected) =>
          ids.length != 0 &&
          ids.reduce((prev, curr) => prev || selected.has(curr), false) &&
          !ids.reduce((prev, curr) => prev && selected.has(curr), true)
      ),
      shareReplay(1)
    );
  }

  isSelected$(...ids: string[]) {
    return this.selectedDataFiles$.pipe(
      map(
        (selected) =>
          ids.length != 0 &&
          ids.reduce((prev, curr) => prev && selected.has(curr), true)
      ),
      shareReplay(1)
    );
  }

  addMapFilters(filters: (RadiusFilter | AreaFilter)[]) {
    const collection = this.selectedCollectionSubject.value;
    if (collection == null) return;

    let allSame = true;

    const mapFilters = collection.filterSet.filter((filter) =>
      isMapFilter(filter)
    );

    for (const filter of filters) {
      if (mapFilters.find((mapFilter) => mapFilter == filter) == null) {
        collection.filterSet.push(filter);
        allSame = false;
      }
    }

    for (const mapFilter of mapFilters) {
      if (filters.find((filter) => filter == mapFilter) == null) {
        const index = collection.filterSet.indexOf(mapFilter);
        collection.filterSet.splice(index, 1);
        allSame = false;
      }
    }
  }
}
