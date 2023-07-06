import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, map, startWith } from 'rxjs';
import {
  BaseDataFile,
  DataType,
  Datafile,
  MediaType,
  NotRef,
  NotRefDataFile,
  Ref,
  RefDataFile,
} from '../../../../common/types/datafile';
import { SupportedDatasetFileTypes } from '../../../../common/types/supportedFileTypes';
import { ApiService } from '../api.service';
import { MapComponent } from '../map/map.component';
import { CoordinateService } from '../map/services/coordinate.service';
import { NotificationService } from '../notification.service';

interface DropdownOption {
  value: string;
  viewValue: string;
}

/**
 * Sources:
 * We use the components and examples from https://material.angular.io/components/categories.
 * In particular, we use and adopted the code from:
 * https://material.angular.io/components/chips/examples#chips-autocomplete for the keyword input
 * https://material.angular.io/components/select/overview for the dropdown
 *
 *
 * @author: Theodor Barkow, May 19, 2023; 6:31 p.m.
 */

@Component({
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.scss'],
})
export class UploadDataComponent {
  isCreatingDataFile = true;
  id?: string | null;

  title?: string;
  description?: string;
  isReferencedData = false;
  selectedKeywords: string[] = [];


  data?: string;
  url?: string;
  mediaType?: MediaType;

  longitude?: number;
  latitude?: number;

  dataFile?: RefDataFile | NotRefDataFile;

  mediaTypeOptions: DropdownOption[] = [
    { value: MediaType.PHOTO, viewValue: 'Picture' },
    { value: MediaType.VIDEO, viewValue: 'Video' },
    { value: MediaType.SOUNDFILE, viewValue: 'Sound' },
  ];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordFormControl = new FormControl('');
  filteredKeywords: Observable<string[]>;
  availablePredefinedKeywords: string[] = ['SimRa', 'Kreuzberg', 'UdK', 'TU'];

  isFileDragOver = false;

  @ViewChild('dataTextArea') dataTextArea?: ElementRef<HTMLTextAreaElement>;

  @ViewChild('keywordInput') keywordInput?: ElementRef<HTMLInputElement>;

  @ViewChild('uploadMapComponent')
  uploadMapComponent?: MapComponent

  constructor(
    private coordinateService: CoordinateService,
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    this.filteredKeywords = this.keywordFormControl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) =>
        keyword
          ? this._filter(keyword)
          : this.availablePredefinedKeywords.slice()
      )
    );

    if (router.url.startsWith('/data-sets/')) {
      this.id = this.activatedRoute.snapshot.paramMap.get('data-set-id');
      this.isCreatingDataFile = false;
      this.apiService.getDatafile(this.id!).subscribe((result) => {
        this.title = result.title;
        this.description = result.description;
        this.selectedKeywords = result.tags;
        this.isReferencedData = result.dataType === DataType.REFERENCED;
        this.data = JSON.stringify((result.content as NotRef)?.data);
        this.url = (result.content as Ref)?.url;
        this.mediaType = (result.content as Ref)?.mediaType;
        this.longitude = result.content.location?.coordinates[0];
        this.latitude = result.content.location?.coordinates[1];

        if (this.uploadMapComponent && this.longitude && this.latitude) {
          this.uploadMapComponent.drawLongLatCoords(
            this.longitude!,
            this.latitude!
          );
        }
      })
    } else {
      this.isCreatingDataFile = true;
    }
  }

  @HostListener('document:keyup')
  refresh_data() {
    this.dataFile = this.toDataFile() as RefDataFile | NotRefDataFile;
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

  handleFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isFileDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) {
          this.data = content.toString();
        }
      };

      reader.readAsText(file);
    }
  }

  handleFileDragOver(event: DragEvent) {
    event.preventDefault();
    this.isFileDragOver = true;
  }

  handleFileDragLeave() {
    this.isFileDragOver = false;
  }

  remove(fruit: string): void {
    const index = this.selectedKeywords.indexOf(fruit);

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
      this.selectedKeywords.length > 0;

    if (!commonDataIsValid) {
      return false;
    }

    if (this.isReferencedData) {
      return (
        this.mediaType != null &&
        this.url != null &&
        this.url.length > 0 &&
        this.longitude != null &&
        this.latitude != null
      );
    } else {
      return this.data != null && this.data.length > 0;
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availablePredefinedKeywords.filter((fruit) =>
      fruit.toLowerCase().includes(filterValue)
    );
  }

  uploadData() {
    if (!this.formIsValid()) {
      return;
    }
    const data = this.toDataFile();

    this.apiService
      .createDatafile(data)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          throw err.message;
        })
      )
      .subscribe(() => {
        this.resetForm();
        const creationSuccessfull = this.translate.instant(
          'createUpdateDatafile.creationSuccess'
        );
        this.notificationService.showInfo(creationSuccessfull);
      });
  }

  updateData() {
    if (!this.formIsValid()) {
      return;
    }
    const data = this.toDataFile();

    this.apiService
      .updateDatafile(this.id!, data)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          throw err.message;
        })
      )
      .subscribe(() => {
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
    this.data = undefined;
    this.url = undefined;
    this.mediaType = undefined;
    this.longitude = undefined;
    this.latitude = undefined;

    if (this.uploadMapComponent) {
      this.uploadMapComponent.resetMap();
    }
  }

  toDataFile(): Datafile {
    let baseFile: BaseDataFile = {
      title: this.title!,
      description: this.description,
      tags: this.selectedKeywords,
      dataSet: SupportedDatasetFileTypes.NONE, // TO-DO: Fix
    };
    if (this.isReferencedData) {
      return {
        ...baseFile,
        dataType: DataType.REFERENCED,
        content: {
          url: this.url!,
          mediaType: this.mediaType!,
          location: {
            type: 'Point',
            coordinates: [this.longitude!, this.latitude!],
          },
        },
      };
    } else {
      return {
        ...baseFile,
        dataType: DataType.NOTREFERENCED,
        content: {
          data: JSON.parse(this.data!),
          location:
            this.latitude != null && this.latitude != null
              ? {
                  type: 'Point',
                  coordinates: [this.longitude!, this.latitude!],
                }
              : undefined,
        },
      };
    }
  }
}
