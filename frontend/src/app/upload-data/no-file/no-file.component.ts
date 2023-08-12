import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, delay, map, startWith } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
import { MapComponent } from 'src/app/map/map.component';
import { CoordinateService } from 'src/app/shared/service/coordinate.service';
import { NotificationService } from 'src/app/notification.service';
import {
  MediaType,
  DataType,
  NotRef,
  Ref,
  Datafile,
  JsonObject,
} from '../../../../../common/types/datafile';
import { SupportedDatasetFileTypes } from '../../../../../common/types/supportedFileTypes';
import { Location } from '@angular/common';

interface DropdownOption {
  value: string;
  viewValue: string;
}

/**
 * The Component includes the upload referenced data and textual data.
 * Also, this component is used to modify an uploaded data file.
 * 
 * Sources:
 * We use the components and examples from https://material.angular.io/components/categories.
 * In particular, we use and adopted the code from:
 * https://material.angular.io/components/chips/examples#chips-autocomplete for the keyword input
 * https://material.angular.io/components/select/overview for the dropdown
 */
@Component({
  templateUrl: './no-file.component.html',
  styleUrls: ['./no-file.component.scss'],
})
export class NoFileUploadComponent {
  isCreatingDataFile = true;
  id?: string | null;

  title?: string;
  description?: string;
  isReferencedData = true;
  selectedKeywords: string[] = [];

  text?: string;
  isTextExpanded: boolean = false;
  url?: string;
  mediaType?: MediaType;

  longitude?: number;
  latitude?: number;

  mediaTypeOptions: DropdownOption[] = [
    { value: MediaType.PHOTO, viewValue: 'Picture' },
    { value: MediaType.VIDEO, viewValue: 'Video' },
    { value: MediaType.SOUNDFILE, viewValue: 'Sound' },
  ];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordFormControl = new FormControl('');
  filteredKeywords: Observable<string[]>;

  //In the future this can be changed to desired keywords or even  loaded from the backend
  availablePredefinedKeywords: string[] = ['SimRa', 'Kreuzberg', 'UdK', 'TU'];
  isLoading = false;
  isFileDragOver = false;

  @ViewChild('dataTextArea') dataTextArea?: ElementRef<HTMLTextAreaElement>;

  @ViewChild('keywordInput') keywordInput?: ElementRef<HTMLInputElement>;

  @ViewChild('uploadMapComponent')
  uploadMapComponent?: MapComponent;

  constructor(
    private coordinateService: CoordinateService,
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    this.filteredKeywords = this.keywordFormControl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) =>
        keyword
          ? this.filter(keyword)
          : this.availablePredefinedKeywords.slice()
      )
    );

    if (this.router.url.startsWith('/data-sets/')) {
      //Data set already exists -> this data set will be modified
      this.id = this.activatedRoute.snapshot.paramMap.get('data-set-id');
      this.isCreatingDataFile = false;
      //load data file
      this.apiService.getDatafile(this.id!).subscribe((result) => {
        this.title = result.title;
        this.description = result.description;
        this.selectedKeywords = result.tags;
        this.isReferencedData = result.dataType === DataType.REFERENCED;
        this.text = JSON.stringify((result.content as NotRef)?.data, null, 2);
        this.url = (result.content as Ref)?.url;
        this.mediaType = (result.content as Ref)?.mediaType;
        this.longitude = result.content.location?.coordinates[0];
        this.latitude = result.content.location?.coordinates[1];

        if (this.uploadMapComponent && this.longitude && this.latitude) {
          //if able, draw coordinate on map
          this.uploadMapComponent.drawLongLatCoords(
            this.longitude!,
            this.latitude!
          );
        }
      });
    } else {
      this.isCreatingDataFile = true;
    }
  }

  expandTextArea(): void {
    this.isTextExpanded = true;
  }

  resetTextArea(): void {
    this.isTextExpanded = false;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    //add keyword
    if (value) {
      this.selectedKeywords.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.keywordFormControl.setValue(null);
  }

  remove(keyword: string): void {
    const index = this.selectedKeywords.indexOf(keyword);

    if (index >= 0) {
      this.selectedKeywords.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedKeywords.push(event.option.viewValue);
    if (this.keywordInput) {
      this.keywordInput.nativeElement.value = '';
    }
    this.keywordFormControl.setValue(null);
  }

  formIsValid(): boolean {
    const commonDataIsValid =
      this.title != null &&
      this.title.length > 0 &&
      this.selectedKeywords.length > 0 &&
      this.longitude != null &&
      this.latitude != null;

    if (!commonDataIsValid) {
      return false;
    }

    if (this.isReferencedData) {
      return this.mediaType != null && this.url != null && this.url.length > 0;
    } else {
      return this.text != null && this.text.length > 0;
    }
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availablePredefinedKeywords.filter((keyword) =>
      keyword.toLowerCase().includes(filterValue)
    );
  }

  /** Creates a new data file */
  uploadData() {
    if (!this.formIsValid()) {
      return;
    }
    const data = this.toDataFile();
    this.isLoading = true;

    this.apiService
      .createDatafile(data)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          throw err.message;
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        this.resetForm();
        const creationSuccessfull = this.translate.instant(
          'createUpdateDatafile.creationSuccess'
        );
        this.notificationService.showInfo(creationSuccessfull);
      });
  }

  /** Updates an existing file */
  updateData() {
    if (!this.formIsValid()) {
      return;
    }
    const data = this.toDataFile();
    this.isLoading = true;
    this.apiService
      .updateDatafile(this.id!, data)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          throw err.message;
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        const updateSuccessfull = this.translate.instant(
          'createUpdateDatafile.updateSuccess'
        );
        this.notificationService.showInfo(updateSuccessfull);
      });
  }

  handleCoordinateChange(coords: [number, number]) {
    const transformedCoord = this.coordinateService.transformToLongLat(coords);
    this.longitude = transformedCoord[0];
    this.latitude = transformedCoord[1];
  }

  resetForm() {
    this.title = undefined;
    this.description = undefined;
    this.selectedKeywords = [];
    this.isReferencedData = false;
    this.text = undefined;
    this.url = undefined;
    this.mediaType = undefined;
    this.longitude = undefined;
    this.latitude = undefined;

    if (this.uploadMapComponent) {
      this.uploadMapComponent.resetMap();
    }
  }

  /** Transforms the values of the form into a datafile object */
  toDataFile(): Datafile {
    let content: Ref | NotRef;
    if (this.isReferencedData) {
      content = {
        url: this.url!,
        mediaType: this.mediaType!,
        location: {
          type: 'Point',
          coordinates: [this.longitude!, this.latitude!],
        },
      };
    } else {
      content = {
        data: { text: this.text! as unknown as JsonObject }, //this will also escape "bad" characters in the text
        location:
          this.latitude != null && this.latitude != null
            ? { type: 'Point', coordinates: [this.longitude!, this.latitude!] }
            : undefined,
      };
    }

    return {
      title: this.title!,
      description: this.description,
      dataType:
        this.isReferencedData === true
          ? DataType.REFERENCED
          : DataType.NOTREFERENCED,
      tags: this.selectedKeywords,
      dataSet: SupportedDatasetFileTypes.NONE,
      content: content,
    };
  }

  navigateBack() {
    this.location.back();
  }
}
