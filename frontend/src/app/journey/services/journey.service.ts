import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AreaFilter,
  Collection,
  Datafile,
  Journey,
  PaginationResult,
  RadiusFilter,
  Visibility,
} from '@common/types';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  combineLatest,
  delay,
  filter,
  finalize,
  first,
  map,
  of,
  pairwise,
  shareReplay,
  skip,
  switchMap,
  takeUntil
} from 'rxjs';
import { colors } from '../../../util/colors';
import { isMapFilter } from '../../../util/filter-utils';
import { DownloadService } from '../../download.service';
import { ApiService } from '../../shared/service/api.service';
import { AuthService } from '../../shared/services/auth.service';
import { ContinueJourneyDialogComponent } from '../continue-journey-dialog/continue-journey-dialog.component';

/**
 * Data used to enrich a Collection.
 */
export interface CollectionData {
  collection: Collection;
  files: PaginationResult<Datafile>;
  color: string; // hex string
  selectedFilesIds: Set<string>;
}

/**
 * # JourneyService
 *
 * The JourneyService provides the state of one Journey tailored to the JourneyComponent.
 * It provides observable streams of the Journey and derived data and selections.
 */
@Injectable()
export class JourneyService {
  private journeySubject = new BehaviorSubject<Journey | null>(null);
  /**
   * State of the Journey.
   */
  journey$ = this.journeySubject.asObservable();

  private selectedDataFilesSubject = new BehaviorSubject<Set<string>>(
    new Set()
  );
  /**
   * Set of ids of selected DataFiles which can be manipulated by `.selectDataFiles(...)` and `.deselectDataFiles(...)` of this service.
   */
  selectedDataFiles$ = this.selectedDataFilesSubject.asObservable();

  private selectedCollectionSubject = new BehaviorSubject<Collection | null>(
    null
  );
  /**
   * Provides one Collection of the Journey which can be selected with `.selectCollection(...)`.
   */
  selectedCollection$ = this.selectedCollectionSubject.asObservable();

  /**
   * Used to inform collectionsData$ that one collection has changed data.
   */
  private triggerCollectionChangeSubject =
    new BehaviorSubject<Collection | null>(null);
  /**
   * Used to reload the DataFiles of a Collection in collectionsData$. Used for filter changes.
   */
  private triggerCollectionReloadSubject =
    new BehaviorSubject<Collection | null>(null);

  /**
   * Provides the Collections of the Journey with enriched information. This includes a generated color, fetched DataFiles and the selected DataFiles.
   */
  collectionsData$: Observable<Observable<CollectionData>[]> =
    this.journey$.pipe(
      map((journey) => {
        if (journey == null || journey.collections.length == 0) return [];
        // Reset the change triggers, so all collection load once.
        this.triggerCollectionChangeSubject.next(null);
        this.triggerCollectionReloadSubject.next(null);

        // Map each Collection an Observable to its CollectionData.
        return journey.collections.map((collection, i) =>
          this.triggerCollectionReloadSubject.pipe(
            //complete the observable when a new Journey emits
            takeUntil(this.journey$.pipe(skip(1))),
            filter((col) => col == collection || col == null),
            switchMap(() =>
              combineLatest([
                this.getCollectionDataFiles(collection),
                this.selectedDataFiles$,
                this.triggerCollectionChangeSubject.pipe(
                  filter((col) => col == collection || col == null)
                ),
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
      shareReplay(1)
    );

  constructor(
    private apiService: ApiService,
    private downloadService: DownloadService,
    private dialog: MatDialog,
    private auth: AuthService
  ) {
    // This subscription selects all new DataFiles and deselects all that got removed by filtering
    this.collectionsData$
      .pipe(
        switchMap((collectionsData) =>
          collectionsData.length == 0 ? of([]) : combineLatest(collectionsData)
        ),
        // I don't know if it is a Bug or if I am missing something, but without the delay(0) the output of the collectionsData$ results are inverted...
        // this leads to that no points are shown on the map on first load.
        delay(0),
        map((data) =>
          data.reduce(
            (results, d) => results.concat(d.files.results),
            [] as Datafile[]
          )
        ),
        pairwise()
      )
      .subscribe(([previous, current]) => {
        const newDataFiles = current.filter(
          (currData) =>
            !previous.find((prevData) => prevData._id == currData._id)
        );
        const removedDataFiles = previous.filter(
          (prevData) =>
            !current.find((currData) => prevData._id == currData._id)
        );
        if (newDataFiles.length) {
          this.selectDataFiles(...newDataFiles);
        }
        if (removedDataFiles.length) {
          this.deselectDataFiles(...removedDataFiles);
        }
      });
  }

  /**
   * Loads a (new) Journey into the Service which will get emit by the `journey$` Observable.
   * @param id of the Journey to load. When null is given a new Journey will be created.
   * @returns an Observable which completes with wether the Journey could be successfully loaded
   */
  loadJourney(id: string | null) {
    const returnSubject = new ReplaySubject();
    const journeyMock: Journey = {
      title: '',
      description: '',
      tags: [],
      author: 'me',
      collections: [],
      visibility: Visibility.PUBLIC,
      excludedIDs: [],
    };

    if (id == null) {
      of(journeyMock).subscribe((val) => this.journeySubject.next(val));
      returnSubject.next(true);
      returnSubject.complete();
    } else
      this.apiService
        .getJourney(id)
        .pipe(
          catchError(() => {
            returnSubject.next(false);
            returnSubject.complete();
            return of(null);
          }),
          finalize(() => {
            returnSubject.next(true);
            returnSubject.complete();
          })
        )
        .subscribe((val) => this.journeySubject.next(val));

    this.journey$
      .pipe(
        filter(
          (journey) =>
            journey != null &&
            journey.collections.find(
              (collection) =>
                collection.title == this.selectedCollectionSubject.value?.title
            ) == null
        ),
        map((journey) => journey!.collections[0])
      )
      .subscribe((val) => this.selectedCollectionSubject.next(val));

    return returnSubject.asObservable();
  }

  /**
   * Reloads the DataFiles of the selected Collection of this service. This should be used when the filters on the Collection were altered.
   */
  reloadSelectedCollection() {
    const selectedCollection = this.selectedCollectionSubject.value;
    this.triggerCollectionReloadSubject.next(selectedCollection);
    this.selectedCollectionSubject.next(selectedCollection);
  }

  /**
   * Triggers the re-emisson of the given Collections CollectionData Observable in collectionsData$.
   * This should be called when data changes on the Collections reference, for instance the `collection.name` has changed.
   * @param collection to emit new
   */
  triggerCollectionChange(collection: Collection) {
    this.triggerCollectionChangeSubject.next(collection);
  }

  /**
   * Saves a new instance of the Journey in the backend with a new `_id`. This effectively "continues" the Journey.
   * @returns an Observable which emits the saved Journey from the backend.
   */
  saveJourney() {
    const journey = this.journeySubject.value;
    if (journey == null) throw new Error('there is no journey to save');

    const dialogRedf = this.dialog.open(ContinueJourneyDialogComponent, {
      data: journey,
    });

    let savedJourney = new Subject<Journey>();
    dialogRedf.afterClosed().subscribe((result) => {
      if (!result) return;
      this.auth.user$.pipe(first()).subscribe((user) => {
        journey.title = result.title;
        journey.description = result.description;
        journey.author = user?.email || '';
        journey.tags = result.tags;
        journey.parentID = journey._id

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

    return savedJourney.asObservable();
  }
  /**
   * Downloads the selected DataFiles.
   */
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

  /**
   * Selects a new Collection in the context of this
   * @param collection to select
   */
  selectCollection(collection: Collection) {
    if (!this.journeySubject.value) return;
    if (!this.journeySubject.value.collections.find((col) => col == collection))
      throw Error(
        'This Collection is not part of the currently loaded Journey!'
      );
    this.selectedCollectionSubject.next(collection);
  }

  /**
   * Adds a new Collection to the Journey
   */
  addCollection() {
    if (!this.journeySubject.value)
      return console.warn(
        'You tried to call addCollection when no Journey was loaded'
      );
    const journey = this.journeySubject.value;
    const collectionTitle = (i: number) => `Collection #${i}`;
    journey.collections.push({
      title: collectionTitle(
        // Find the first non appearing new collection title number.
        (() => {
          let i = 1;
          while (
            this.journeySubject.value?.collections.find(
              (col) => col.title == collectionTitle(i)
            )
          ) {
            i++;
          }
          return i;
        })()
      ),
      filterSet: [],
    });
    this.journeySubject.next(journey);
  }

  /**
   * Deletes a Collection from the Journey
   */
  deleteCollection(collection: Collection) {
    if (!this.journeySubject.value)
      return console.warn(
        'You tried to call deleteCollection when no Journey was loaded'
      );
    const journey = this.journeySubject.value;
    const index = journey.collections.findIndex((col) => col == collection);
    if (index < 0)
      throw Error(
        'This Collection is not part of the currently loaded Journey!'
      );
    journey.collections.splice(index, 1);
    this.journeySubject.next(journey);
  }

  /**
   * Selects DataFiles in this service.
   */
  selectDataFiles(...dataFiles: Datafile[]) {
    const selected = this.selectedDataFilesSubject.value;
    for (let dataFile of dataFiles) selected.add(dataFile._id!);

    this.selectedDataFilesSubject.next(selected);
  }

  /**
   * Deselects DataFiles in this service.
   */
  deselectDataFiles(...dataFiles: Datafile[]) {
    const selected = this.selectedDataFilesSubject.value;
    for (let dataFile of dataFiles) selected.delete(dataFile._id!);

    this.selectedDataFilesSubject.next(selected);
  }

  /**
   * States if a given id of a DataFile is selected in this service.
   * @param id That should be selected
   * @returns An Observable which emits true if the given if of a DataFile is selected.
   */
  isDataFileSelected$(...ids: string[]) {
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

  /**
   * States if all given ids of DataFiles are selected in this service. Used to check if a whole Collection is selected.
   * @param ids That should be selected
   * @returns An Observable which emits true if all given ids of DataFiles are selected.
   */
  areDataFilesSelected$(...ids: string[]) {
    return this.selectedDataFiles$.pipe(
      map(
        (selected) =>
          ids.length != 0 &&
          ids.reduce((prev, curr) => prev && selected.has(curr), true)
      ),
      shareReplay(1)
    );
  }

  /**
   * Adds a list of map filters to the filterSet of the currently selected Collection in this service.
   * The function controls all basic map filters classified by `isMapFilter(...)`of the filter-utils.ts.
   * It deletes all classified filters which are not in the given filters and only adds the ones which are not yet present.
   * @param filters The map filters.
   */
  addMapFilters(filters: (RadiusFilter | AreaFilter)[]) {
    const collection = this.selectedCollectionSubject.value;
    if (collection == null)
      return console.warn(
        'You tried to call addMapFilters when no Collection was selected.'
      );

    const mapFilters = collection.filterSet.filter((filter) =>
      isMapFilter(filter)
    );

    for (const filter of filters) {
      if (mapFilters.find((mapFilter) => mapFilter == filter) == null) {
        collection.filterSet.push(filter);
      }
    }

    for (const mapFilter of mapFilters) {
      if (filters.find((filter) => filter == mapFilter) == null) {
        const index = collection.filterSet.indexOf(mapFilter);
        collection.filterSet.splice(index, 1);
      }
    }
  }

  /**
   * Fetches the DataFiles filtered by the Collections `.filterSet`.
   *
   * Currently the Function request a PaginationResult with a limit of 999999 files.
   * This is not performant and should be changed here and in the CollectionComponent!
   * @param collection Collection to fetch from
   * @returns a PaginationResult of the DataFiles
   */
  getCollectionDataFiles(
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
}
