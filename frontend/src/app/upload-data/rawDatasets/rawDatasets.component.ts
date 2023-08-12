import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map, startWith } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
import { MapComponent } from 'src/app/map/map.component';
import { CoordinateService } from 'src/app/shared/service/coordinate.service';
import { NotificationService } from 'src/app/notification.service';
import { DataType, Datafile, NotRef } from '../../../../../common/types/datafile';
import { SupportedDatasetFileTypes, SupportedRawFileTypes } from '../../../../../common/types/supportedFileTypes';


/**
 * The Component includes the upload of files, which are not datasets.
 * 
 * Sources:
 * We use the components and examples from https://material.angular.io/components/categories.
 * In particular, we use and adopted the code from:
 * https://material.angular.io/components/chips/examples#chips-autocomplete for the keyword input
 * https://material.angular.io/components/select/overview for the dropdown
 */
@Component({
  templateUrl: './rawDatasets.component.html',
  styleUrls: ['./rawDatasets.component.scss']
})
export class RawDatasetsUploadComponent {
  RawDatasetTypeEnum = SupportedRawFileTypes;
  rawDatasetType?: SupportedRawFileTypes;
  acceptFileFormat = "";

  id?: string | null;
  title?: string;
  description?: string;
  isReferencedData = false;
  selectedKeywords: string[] = [];
  
  file?: File;
  longitude?: number;
  latitude?: number;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordFormControl = new FormControl('');
  filteredKeywords: Observable<string[]>;

  //In the future this can be changed to desired keywords or even  loaded from the backend
  availablePredefinedKeywords: string[] = ['SimRa', 'Kreuzberg', 'UdK', 'TU'];

  isFileDragOver = false;
  isLoading = false;

  @ViewChild('dataTextArea') dataTextArea?: ElementRef<HTMLTextAreaElement>;

  @ViewChild('keywordInput') keywordInput?: ElementRef<HTMLInputElement>;

  @ViewChild('uploadMapComponent')
  uploadMapComponent?: MapComponent

  constructor(private coordinateService: CoordinateService, private apiService: ApiService, private router: Router, private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService, private translate: TranslateService) {
    this.filteredKeywords = this.keywordFormControl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) => (keyword ? this.filter(keyword) : this.availablePredefinedKeywords.slice())),
    );

    //Set types and allowed file format
    if (router.url.startsWith("/upload-data/json")) {
      this.rawDatasetType = SupportedRawFileTypes.JSON;
      this.acceptFileFormat = ".json"
    } else if (router.url.startsWith("/upload-data/csv")) {
      this.rawDatasetType = SupportedRawFileTypes.CSV;
      this.acceptFileFormat = ".csv"
    } else if (router.url.startsWith("/upload-data/txt")) {
      this.rawDatasetType = SupportedRawFileTypes.TXT;
      this.acceptFileFormat = ".txt"
    } else if (router.url.startsWith("/netcdf")) {
      // this.rawDatasetType = RawDatasetType.NETCDF;
      // this.acceptFileFormat = ".netcdf"
      console.error("NETCDF IS NOT SUPPORTED YET")
    }
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

  handleFileDragOver(event: DragEvent) {
    event.preventDefault();
    this.isFileDragOver = true;
  }

  handleFileDragLeave() {
    this.isFileDragOver = false;
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
    const commonDataIsValid = this.title != null && this.title.length > 0 && this.selectedKeywords.length > 0;

    if (!commonDataIsValid) {
      return false;
    }

    return this.file != undefined;
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availablePredefinedKeywords.filter(keyword => keyword.toLowerCase().includes(filterValue));
  }

  /** Creates a new data file */
  uploadData() {
    if (!this.formIsValid()) {
      return;
    }

    const data = this.toDataFile();
    this.isLoading = true;

    this.apiService.createDatafileWithFile(data, this.file!, this.rawDatasetType!).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetForm();
        const creationSuccessfull = this.translate.instant('createUpdateDatafile.creationSuccess');
        this.notificationService.showInfo(creationSuccessfull);
    },
      error: (err: HttpErrorResponse) => {
        if(err.status === 422){
          const creationSuccessfull = this.translate.instant('createUpdateDatafile.fileAttachError');
          this.notificationService.showInfo(creationSuccessfull);
        } else {
          const errorMsg = this.translate.instant('createUpdateDatafile.error');
          this.notificationService.showInfo(errorMsg);
        }
      }});
  }

  onUpload(event: any) {
    this.file = event.files[0];
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
    this.file = undefined;
    this.longitude = undefined;
    this.latitude = undefined;

    if (this.uploadMapComponent) {
      this.uploadMapComponent.resetMap()
    }
  }

  /** Transforms the values of the form into a datafile object */
  toDataFile(): Datafile {
    const content:  NotRef = {
        data: JSON.parse("{}"),
        location: this.latitude != null && this.latitude != null ? { type: 'Point', coordinates: [this.longitude!, this.latitude!] } : undefined
    }

    return {
      title: this.title!,
      description: this.description,
      dataType: this.isReferencedData === true ? DataType.REFERENCED : DataType.NOTREFERENCED,
      dataSet: SupportedDatasetFileTypes.NONE,
      tags: this.selectedKeywords,
      content: content
    };
  }

  /** Stops the propagation of the file upload event */
  stopPropagation(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: any) {
    this.stopPropagation(event);
    this.file = event.dataTransfer.files[0] as File;
    this.setTitle();
  }

  onFileSelect(event: any) {
    this.file = event.files[0];
    this.setTitle();
  }

  private setTitle(){
    if(this.title == null && this.file != null){
      this.title = this.file.name.split(".").shift();
    }
  }
}