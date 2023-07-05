import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map, catchError } from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/api.service';
import { NotificationService } from 'src/app/notification.service';
import { CoordinateService } from 'src/app/map/service/coordinate.service';
import { MapComponent } from 'src/app/map/map.component';
import { MediaType, DataType, NotRef, Ref, Datafile } from '../../../../../common/types/datafile';
import { SupportedDatasetFileTypes } from '../../../../../common/types/supportedFileTypes';


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
  templateUrl: './supportedDatasets.component.html',
  styleUrls: ['./supportedDatasets.component.scss']
})
export class SupportedDatasetsUploadComponent {
  DatasetFileTypeEnums = SupportedDatasetFileTypes;
  datasetType?: SupportedDatasetFileTypes;
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
  isCreatingDataFile = true;
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

      if(router.url.startsWith("/simra")){
        this.datasetType = SupportedDatasetFileTypes.SIMRA;
        this.acceptFileFormat = ".txt";
      }
      else if(router.url.startsWith("/cerv2")){
        this.datasetType = SupportedDatasetFileTypes.CERV2;
        this.acceptFileFormat = ".netcdf";       
     }

      if(router.url.startsWith("/data-sets/")){
        this.id = this.activatedRoute.snapshot.paramMap.get('data-set-id');
        this.isCreatingDataFile = false;
        this.apiService.getDatafiles(this.id!).subscribe(result => {
          this.title = result.title;
          this.description = result.description;
          this.selectedKeywords = result.tags;

  
          if(this.uploadMapComponent && this.longitude && this.latitude){
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
      if(this.keywordInput){
        this.keywordInput.nativeElement.value = '';
      }
      this.keywordFormControl.setValue(null);
    }
  
    formIsValid(): boolean { 
      return this.file != null && this.datasetType != null;
    }
  
    private _filter(value: string): string[] {
      const filterValue = value.toLowerCase();
  
      return this.availablePredefinedKeywords.filter(fruit => fruit.toLowerCase().includes(filterValue));
    }
  
    uploadData() {
      if (!this.formIsValid()) {
        return;
      }

      this.apiService.createDatasetFromFile(this.file!, this.datasetType!, this.selectedKeywords, this.description ).subscribe({
        next: () => {
        this.resetForm();
        const creationSuccessfull = this.translate.instant('createUpdateDatafile.creationSuccess');
        this.notificationService.showInfo(creationSuccessfull);
      },
        error: (err: HttpErrorResponse) => {
            this.notificationService.showInfo("SOME ERROR");
        }});
    }
  
    onUpload(event: any) {
      this.file = event.files[0];
    }
  
    updateData() {
      // if (!this.formIsValid()) {
      //   return;
      // }
      // const data = this.toDataFile();
  
      // this.apiService.updateDatafile(this.id!, data).pipe(catchError((err: HttpErrorResponse) => {
      //   throw err.message
      // })).subscribe(() => {
      //   const updateSuccessfull = this.translate.instant('createUpdateDatafile.updateSuccess');
      //   this.notificationService.showInfo(updateSuccessfull)
      // });
    }
  
    
    resetForm() {
      this.description = undefined;
      this.selectedKeywords = [];
      this.file = undefined;
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