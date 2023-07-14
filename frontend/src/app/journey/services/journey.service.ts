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
} from 'rxjs';
import { ApiService } from '../../shared/service/api.service';
import { colors } from '../../../util/colors';
import { hashObj } from '../../../util/hash';
import { DisplayCollection } from '../../map/map.component';

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
      if (journey == null) return of([]);
      return forkJoin(
        journey.collections.map((collection) =>
          this.getCollection(collection).pipe(
            map(
              (dataFiles, i) =>
                ({
                  collection: collection,
                  files: dataFiles,
                  color: colors[hashObj(i + collection.title) % colors.length],
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

  constructor(private apiService: ApiService) {}

  loadJourney(id: string | null) {
    const journeyMock: Journey = {
      title: 'Test Journey',
      description: 'this is a description',
      tags: ['one tag', 'second tag'],
      author: 'me',
      collections: [
        {
          title: 'Collection 1',
          filterSet: [
            {
              key: 'tags',
              operation: FilterOperations.CONTAINS,
              value: 'fake',
              negate: false,
            },
          ],
        },
        {
          title: 'Collection 2',
          filterSet: [
            {
              key: 'tags',
              operation: FilterOperations.CONTAINS,
              value: 'fake',
              negate: false,
            },
            {
              booleanOperation: BooleanOperation.OR,
              filters: [
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'clear',
                  negate: false,
                },
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'school',
                  negate: false,
                },
              ],
            },
          ],
        },
        {
          title: 'Collection 3',
          filterSet: [
            {
              booleanOperation: BooleanOperation.OR,
              filters: [
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'clear',
                  negate: false,
                },
                {
                  key: 'tags',
                  operation: FilterOperations.CONTAINS,
                  value: 'school',
                  negate: false,
                },
              ],
            },
          ],
        },
      ],
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
  }

  reloadJourney() {
    this.journeySubject.next(this.journeySubject.value);
  }

  saveJourney() {
    const journey = this.journeySubject.value;
    console.log(journey);
    let savedJourney: Observable<Journey>;
    if (journey == null) throw new Error('there is no journey to save');
    if (journey._id)
      savedJourney = this.apiService
        .updateJourney(journey)
        .pipe(shareReplay(1));
    else
      savedJourney = this.apiService
        .createJourney(journey)
        .pipe(shareReplay(1));
    savedJourney.subscribe((journey) => this.journeySubject.next(journey));
    return savedJourney;
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

  getCollection(
    collection: Collection
  ): Observable<PaginationResult<Datafile>> {
    if (collection.filterSet.length == 0)
      return of({
        skip: 0,
        limit: 10,
        totalCount: 0,
        results: [],
      });
    return this.apiService.filterDatafiles(
      { filterSet: collection.filterSet },
      10,
      0
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
    // const collection = this.selectedCollectionSubject.value;
    // if (collection == null) return;

    // const newFilters = filters.filter((filter) =>
    //   collection.filterSet.find((f) => f != filter)
    // );
    // collection.filterSet.push(...filters);
    // this.selectedCollectionSubject.next(collection);
    // console.log(this.journeySubject.value);
  }
}
