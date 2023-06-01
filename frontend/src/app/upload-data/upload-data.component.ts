import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map, catchError } from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { CoordinateService } from '../shared/map/service/coordinate.service';
import { DataType, Datafile, MediaType, NotRef, Ref} from '../../../../common/types/datafile'
import { ApiService } from '../api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MapComponent } from '../shared/map/map.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../notification.service';
import { TranslateService } from '@ngx-translate/core';

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
  styleUrls: ['./upload-data.component.scss']
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

  mediaTypeOptions: DropdownOption[] = [
    {value: MediaType.PHOTO, viewValue: 'Picture'},
    {value: MediaType.VIDEO, viewValue: 'Video'},
    {value: MediaType.SOUNDFILE, viewValue: 'Sound'},
  ];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordFormControl = new FormControl('');
  filteredKeywords: Observable<string[]>;
  availablePredefinedKeywords: string[] = ['SimRa', 'Kreuzberg', 'UdK', 'TU'];

  @ViewChild('keywordInput') keywordInput?: ElementRef<HTMLInputElement>;

  @ViewChild('mapComponent')
  mapComponent?: MapComponent

  constructor(private coordService: CoordinateService, private apiService: ApiService, private router: Router, private activatedRoute: ActivatedRoute,
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
        this.longitude = result.content.coords?.longitude;
        this.latitude = result.content.coords?.latitude;

        if(this.mapComponent && this.longitude && this.latitude){
          this.mapComponent.drawLongLatCoords(this.longitude!, this.latitude!)
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
    if(!this.formIsValid()){
      return;
    }
    const data = this.toDataFile();

    this.apiService.createDatafile(data).pipe(catchError((err: HttpErrorResponse) => {
      throw err.message})).subscribe(() => {
        this.resetForm(); 
        const creationSuccessfull = this.translate.instant('createUpdateDatafile.creationSuccess'); 
        this.notificationService.showInfo(creationSuccessfull)
      })
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

  handleCoordinateChange(coords: [number, number]){
    const transformedCoord = this.coordService.transformToLongLat(coords);
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

    if(this.mapComponent){
      this.mapComponent.resetMap()
    }
  }

  toDataFile() : Datafile{
    let content : Ref | NotRef;
    if(this.isReferencedData){
      content = {
        url: this.url!,
        mediaType: this.mediaType!,
        coords: {
          latitude: this.latitude!,
          longitude: this.longitude!,
        }
      }
    } else {
      content = {
        data: JSON.parse(this.data!),
        coords: this.latitude != null && this.latitude != null ? {latitude: this.latitude!,
          longitude: this.longitude! } : undefined
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
}