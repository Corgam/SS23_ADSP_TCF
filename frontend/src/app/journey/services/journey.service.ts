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
  Subject,
  combineLatest,
  debounceTime,
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
import { DownloadService } from '../../download.service';
import { ApiService } from '../../shared/service/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ContinueJourneyDialogComponent } from '../continue-journey-dialog/continue-journey-dialog.component';
import { AuthService } from '../../shared/services/auth.service';

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

  private triggerCollectionChangeSubject = new BehaviorSubject(null);
  private triggerCollectionReloadSubject =
    new BehaviorSubject<Collection | null>(null);

  collectionsData$: Observable<Observable<CollectionData>[]> =
    this.journey$.pipe(
      map((journey) => {
        if (journey == null || journey.collections.length == 0) return [];
        this.triggerCollectionReloadSubject.next(null);

        return journey.collections.map((collection, i) =>
          this.triggerCollectionReloadSubject.pipe(
            filter((col) => col == collection || col == null),
            tap(() => {}),
            switchMap(() =>
              combineLatest([
                this.getCollection(collection),
                this.selectedDataFiles$,
                this.triggerCollectionChangeSubject,
              ]).pipe(
                map(([files, selectedIdsSet, _]) => {
                  return {
                    collection: collection,
                    files: files,
                    color: colors[i],
                    selectedFilesIds: new Set(
                      [...selectedIdsSet].filter(
                        (id) =>
                          files.results.find((file) => file._id == id) != null
                      )
                    ),
                  } as CollectionData;
                })
              )
            ),
            shareReplay(1)
          )
        );
      }),
      debounceTime(20),
      shareReplay(1)
    );

  createdJourneysCounter = 1;

  constructor(
    private apiService: ApiService,
    private downloadService: DownloadService,
    private dialog: MatDialog,
    private auth: AuthService
  ) {}

  loadJourney(id: string | null) {
    const journeyMock: Journey = {
      title: 'New Journey',
      description: 'this is a description',
      tags: [],
      author: 'me',
      collections: [],
      visibility: Visibility.PUBLIC,
      excludedIDs: [],
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
          collectionData
            .pipe(take(1))
            .subscribe((data) => this.selectDataFiles(...data.files.results));
      });
  }

  reloadJourney() {
    this.journeySubject.next(this.journeySubject.value);
    this.triggerCollectionReloadSubject.next(null);
  }

  reloadSelectedCollection() {
    const selectedCollection = this.selectedCollectionSubject.value;
    this.triggerCollectionReloadSubject.next(selectedCollection);
  }

  saveJourney() {
    const journey = this.journeySubject.value;
    if (journey == null) throw new Error('there is no journey to save');

    const dialogRedf = this.dialog.open(ContinueJourneyDialogComponent, {
      data: journey,
    });

    let savedJourney = new Subject<Journey>();
    dialogRedf.afterClosed().subscribe((result) => {
      if (!result) return;
      this.auth.user$.pipe(take(1)).subscribe((user) => {
        journey.title = result.title;
        journey.description = result.description;
        journey.author = user?.email || '';
        journey.tags = result.tags;

        const j = JSON.parse(JSON.stringify(journey));
        delete j._id;
        delete j.createdAt;
        delete j.updatedAt;
        delete j.__v;

        this.apiService.createJourney(j).subscribe((journey) => {
          this.journeySubject.next(journey);
          savedJourney.next(journey);
          savedJourney.complete();
        });
      });
    });

    return savedJourney;
  }

  downloadSelectedData() {
    // this.collectionsData$
    //   .pipe(
    //     take(1),
    //     switchMap((collectionsData) => {
    //       return forkJoin(
    //         collectionsData.map((data) => {
    //           let ids = [...data.selectedFilesIds];
    //           return this.apiService.filterDatafiles(
    //             {
    //               filterSet: [
    //                 {
    //                   booleanOperation: BooleanOperation.OR,
    //                   filters: ids.map((id) => ({
    //                     key: '_id',
    //                     operation: FilterOperations.CONTAINS,
    //                     negate: false,
    //                     value: id,
    //                   })),
    //                 },
    //               ],
    //             },
    //             ids.length,
    //             0,
    //             false
    //           );
    //         })
    //       );
    //     })
    //   )
    //   .subscribe((results) => {
    //     let file = results.map((result) => result.results);
    //     this.downloadService.download(file, 'JourneyResult');
    //   });
  }

  addCollection() {
    const journey = this.journeySubject.value;
    journey?.collections.push({
      title: `Collection #${this.createdJourneysCounter++}`,
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
        limit: 999999,
        totalCount: 0,
        results: [],
      });
    return this.apiService.filterDatafiles(
      { filterSet: collection.filterSet },
      999999,
      0,
      true
    );
  }

  triggerCollectionChange() {
    this.triggerCollectionChangeSubject.next(null);
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
