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
import { MediaType, DataType, NotRef, Ref, Datafile } from '../../../../../common/types/datafile';
import { CoordinateService } from 'src/app/map/service/coordinate.service';
import { MapComponent } from 'src/app/map/map.component';


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
  templateUrl: './cerv2.component.html',
  styleUrls: ['./cerv2.component.scss']
})
export class CerV2UploadComponent {

  selectedFileName: string ='';

  selectedFile: Datafile | undefined;
  uploadedFiles: any[] = [];


  isCreatingDataFile = true;
  id?: string | null;

  street: string | undefined;
  houseNumber: string | undefined;
  zip: string | undefined;
  city: string | undefined;
  address: string | undefined;

  title?: string;
  description?: string;
  isReferencedData = false;
  selectedKeywords: string[] = [];

  showAddressInput: boolean = false;
  addressInput: string = '';

  data?: string;
  url?: string;
  mediaType?: MediaType;

  longitude?: number;
  latitude?: number;

  mediaTypeOptions: DropdownOption[] = [
    {value: MediaType.PHOTO, viewValue: 'Picture'},
    {value: MediaType.VIDEO, viewValue: 'Video'},
    {value: MediaType.SOUNDFILE, viewValue: 'Sound'},
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

  
  constructor(private coordinateService: CoordinateService, private apiService: ApiService, private router: Router, private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService, private translate: TranslateService) {
      this.filteredKeywords = this.keywordFormControl.valueChanges.pipe(
        startWith(null),
        map((keyword: string | null) => (keyword ? this._filter(keyword) : this.availablePredefinedKeywords.slice())),
      );
  
      if(router.url.startsWith("/data-sets/")){
        this.id = this.activatedRoute.snapshot.paramMap.get('data-set-id');
        this.isCreatingDataFile = false;
        this.apiService.getDatafiles(this.id!).subscribe(result => {
          this.title = result.title;
          this.description = result.description;
          this.selectedKeywords = result.tags;
          this.isReferencedData = result.dataType === DataType.REFERENCED;
          this.data = JSON.stringify((result.content as NotRef)?.data);
          this.url = (result.content as Ref)?.url;;
          this.mediaType = (result.content as Ref)?.mediaType;
          this.longitude = result.content.location?.coordinates[0];
          this.latitude = result.content.location?.coordinates[1];
  
          if(this.uploadMapComponent && this.longitude && this.latitude){
            this.uploadMapComponent.drawLongLatCoords(this.longitude!, this.latitude!)
          }
  
          this.updateCoordinateInputs();
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
      if(this.keywordInput){
        this.keywordInput.nativeElement.value = '';
      }
      this.keywordFormControl.setValue(null);
    }
  
    formIsValid() : boolean{
      const commonDataIsValid = this.title != null && this.title.length > 0 && this.selectedKeywords.length > 0;
  
      if(!commonDataIsValid) {
        return false;
      }
  
      if(this.isReferencedData) {
        return this.mediaType != null && this.url != null && this.url.length > 0 && this.longitude != null && this.latitude != null
      } else {
        return this.data != null && this.data.length > 0
      }
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
    
      const files = this.uploadedFiles;
    
      if (!files || files.length === 0) {
        return;
      }
    
      const file = files[0];
    
      this.apiService.createDatafileWithFile(data, file).pipe(
        catchError((err: HttpErrorResponse) => {
          throw err.message;
        })
      ).subscribe(() => {
        this.resetForm();
        const creationSuccessfull = this.translate.instant('createUpdateDatafile.creationSuccess');
        this.notificationService.showInfo(creationSuccessfull);
      });
    }
  
    onUpload(event: any) {
      this.uploadedFiles.push(event.files[0]);
    }
    
  
    updateData() {
      if(!this.formIsValid()){
        return;
      }
      const data = this.toDataFile();
  
      this.apiService.updateDatafile(this.id!, data).pipe(catchError((err: HttpErrorResponse) => {
          throw err.message})).subscribe(() => {
            const updateSuccessfull = this.translate.instant('createUpdateDatafile.updateSuccess'); 
            this.notificationService.showInfo(updateSuccessfull)
          });
    }
  
    handleCoordinateChange(coords: [number, number]) {
      const transformedCoord = this.coordinateService.transformToLongLat(coords);
      this.longitude = transformedCoord[0];
      this.latitude = transformedCoord[1];
      this.updateCoordinateInputs();
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
  
      if(this.uploadMapComponent){
        this.uploadMapComponent.resetMap()
      }
    }
  
    toDataFile() : Datafile{
      let content : Ref | NotRef;
      if(this.isReferencedData){
        content = {
          url: this.url!,
          mediaType: this.mediaType!,
          location: {
            type: 'Point',
            coordinates: [this.longitude!, this.latitude!]
          }
        }
      } else {
        content = {
          data: JSON.parse(this.data!),
          location: this.latitude != null && this.latitude != null ? { type: 'Point', coordinates: [this.longitude!, this.latitude!] } : undefined
        }
      }
  
      return {
        title: this.title!, 
        description: this.description, 
        dataType: this.isReferencedData === true ? DataType.REFERENCED : DataType.NOTREFERENCED,
        tags: this.selectedKeywords,
        content: content
      };
    }
  
    searchAddress() {
      const fullAddress = `${this.street} ${this.houseNumber ?? ''} ${this.zip ?? ''} ${this.city ?? ''}`.trim();
    
      this.apiService.geocodeAddress(fullAddress).subscribe(coordinate => {
        if (coordinate) {
          if (this.uploadMapComponent) {
            this.uploadMapComponent.drawLongLatCoords(coordinate[0], coordinate[1]);
          } else {
            const mapLookupFail = this.translate.instant('map.lookupFail');
            this.notificationService.showInfo(mapLookupFail);
          }
          this.longitude = coordinate[0];
          this.latitude = coordinate[1];
          this.updateCoordinateInputs();
    
          this.address = fullAddress;
        } else {
          const addressNotFound = this.translate.instant('map.noaddressfound');
          this.notificationService.showInfo(addressNotFound);
        }
      });
    }
    
    updateCoordinateInputs() {
      if (this.longitude != null && this.latitude != null) {
        const coordinateString = `${this.latitude}, ${this.longitude}`;
        this.apiService.getAddress(coordinateString).subscribe((address) => {
          if (address) {
            this.address = address;
          } else {
            const mapLookupFail = this.translate.instant('map.lookupfail');
            this.notificationService.showInfo(mapLookupFail);
          }
        });
      }
    }
   
    onDragEnter(event: any) {
      event.preventDefault();
      event.stopPropagation();
    }
  
    onDragLeave(event: any) {
      event.preventDefault();
      event.stopPropagation();
    }
  
    onFileDrop(event: any) {
      event.preventDefault();
      event.stopPropagation();
      const files = event.dataTransfer.files;
    
      if (files && files.length > 0) {
        const file = files[0];
        this.selectedFileName = file.name;
      }
    }

    onDragOver(event: any) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onFileSelect(event: any) {
      const file = event.files[0];
      this.selectedFileName = file.name;
    }
  }