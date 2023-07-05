import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map, catchError, of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/api.service';
import { NotificationService } from 'src/app/notification.service';
import { CoordinateService } from 'src/app/map/service/coordinate.service';
import { MapComponent } from 'src/app/map/map.component';
import { MediaType, DataType, NotRef, Ref, Datafile } from '../../../../../common/types/datafile';
import { SupportedDatasetFileTypes, SupportedRawFileTypes } from '../../../../../common/types/supportedFileTypes';


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
  templateUrl: './rawDatasets.component.html',
  styleUrls: ['./rawDatasets.component.scss']
})
export class RawDatasetsUploadComponent {
  isCreatingDataFile = true;
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
  availablePredefinedKeywords: string[] = ['SimRa', 'Kreuzberg', 'UdK', 'TU'];

  isFileDragOver = false;

  @ViewChild('dataTextArea') dataTextArea?: ElementRef<HTMLTextAreaElement>;

  @ViewChild('keywordInput') keywordInput?: ElementRef<HTMLInputElement>;

  @ViewChild('uploadMapComponent')
  uploadMapComponent?: MapComponent

  constructor(private coordinateService: CoordinateService, private apiService: ApiService, private router: Router, private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService, private translate: TranslateService) {
    this.filteredKeywords = this.keywordFormControl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) => (keyword ? this._filter(keyword) : this.availablePredefinedKeywords.slice())),
    );
    if (router.url.startsWith("/json")) {
      this.rawDatasetType = SupportedRawFileTypes.JSON;
      this.acceptFileFormat = ".json"
    } else if (router.url.startsWith("/csv")) {
      this.rawDatasetType = SupportedRawFileTypes.CSV;
      this.acceptFileFormat = ".csv"
    } else if (router.url.startsWith("/txt")) {
      this.rawDatasetType = SupportedRawFileTypes.TXT;
      this.acceptFileFormat = ".txt"
    } else if (router.url.startsWith("/netcdf")) {
      // this.rawDatasetType = RawDatasetType.NETCDF;
      // this.acceptFileFormat = ".netcdf"
      console.error("NETCDF IS NOT SUPPORTED YET")
    }

    if (router.url.startsWith("/data-sets/")) {
      this.id = this.activatedRoute.snapshot.paramMap.get('data-set-id');
      this.isCreatingDataFile = false;
      this.apiService.getDatafiles(this.id!).subscribe(result => {
        this.title = result.title;
        this.description = result.description;
        this.selectedKeywords = result.tags;
        this.longitude = result.content.location?.coordinates[0];
        this.latitude = result.content.location?.coordinates[1];

        if (this.uploadMapComponent && this.longitude && this.latitude) {
          this.uploadMapComponent.drawLongLatCoords(this.longitude!, this.latitude!)
        }

      })
    } else {
      this.isCreatingDataFile = true;
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
    const commonDataIsValid = this.title != null && this.title.length > 0 && this.selectedKeywords.length > 0;

    if (!commonDataIsValid) {
      return false;
    }

    return this.file != undefined;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availablePredefinedKeywords.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }

  uploadData() {
    if (!this.formIsValid()) {
      return;
    }

    const data = this.toDataFile();

    this.apiService.createDatafileWithFile(data, this.file!, this.rawDatasetType!).subscribe({
      next: () => {
      this.resetForm();
      const creationSuccessfull = this.translate.instant('createUpdateDatafile.creationSuccess');
      this.notificationService.showInfo(creationSuccessfull);
    },
      error: (err: HttpErrorResponse) => {
        if(err.status === 422){
          const creationSuccessfull = this.translate.instant('createUpdateDatafile.fileAttachError');
          this.notificationService.showInfo(creationSuccessfull);
        } else {
          this.notificationService.showInfo("SOME ERROR");
        }
      }});
  }

  onUpload(event: any) {
    this.file = event.files[0];
  }

  updateData() {
    if (!this.formIsValid()) {
      return;
    }
    const data = this.toDataFile();

    this.apiService.updateDatafile(this.id!, data).pipe(catchError((err: HttpErrorResponse) => {
      throw err.message
    })).subscribe(() => {
      const updateSuccessfull = this.translate.instant('createUpdateDatafile.updateSuccess');
      this.notificationService.showInfo(updateSuccessfull)
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
    this.file = undefined;
    this.longitude = undefined;
    this.latitude = undefined;

    if (this.uploadMapComponent) {
      this.uploadMapComponent.resetMap()
    }
  }

  toDataFile(): Datafile {
    const content:  NotRef = {
        data: JSON.parse("{}"),
        location: this.latitude != null && this.latitude != null ? { type: 'Point', coordinates: [this.longitude!, this.latitude!] } : undefined
    }

    return {
      title: this.title!,
      description: this.description,
      dataType: this.isReferencedData === true ? DataType.REFERENCED : DataType.NOTREFERENCED,
      dataSet: SupportedDatasetFileTypes.NONE, // TO-DO: Fix
      tags: this.selectedKeywords,
      content: content
    };
  }

  stopPropagation(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
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

  isFileTypeAllowed(file: File): boolean {
    const allowedExtensions = [this.acceptFileFormat];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension !== undefined && allowedExtensions.includes(fileExtension);
  }
}