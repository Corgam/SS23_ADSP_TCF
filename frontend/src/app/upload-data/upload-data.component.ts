import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map } from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { CoordinateService } from '../shared/map/service/coordinate.service';

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

  title?: string;
  description?: string;
  isReferencedData = false;
  selectedKeywords: string[] = [];

  data?: string;
  url?: string;
  dataType?: string;

  coordinates?: [number, number]
  longitude?: number;
  latitude?: number;

  referencedDataType: DropdownOption[] = [
    {value: 'PICTURE', viewValue: 'Picture'},
    {value: 'VIDEO', viewValue: 'Video'},
    {value: 'OTHER', viewValue: 'Other'},
  ];

  
  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordFormControl = new FormControl('');
  filteredKeywords: Observable<string[]>;
  availablePredefinedKeywords: string[] = ['SimRa', 'Kreuzberg', 'UdK', 'TU'];

  @ViewChild('keywordInput') keywordInput?: ElementRef<HTMLInputElement>;

  constructor(private coordService: CoordinateService) {
    this.filteredKeywords = this.keywordFormControl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) => (keyword ? this._filter(keyword) : this.availablePredefinedKeywords.slice())),
    );
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
      return this.dataType != null && this.url != null && this.url.length > 0 && this.coordinates != null
    } else {
      return this.data != null && this.data.length > 0
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availablePredefinedKeywords.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }

  uploadData() {
    const commonData = {
      title: this.title, 
      description: this.description, 
      isReferencedData: this.isReferencedData,
    };

    if(this.isReferencedData){
      const data = {
        ...commonData,
        dataType: this.dataType,
        url: this.url
      }
      console.log("Would send:", data);
    } else {
      const data = {
        ...commonData,
        data: this.data
      }
      console.log("Would send:", data);
    }
  }

  handleCoordinateChange(coords: [number, number]){
    this.coordinates = coords;
    const transformedCoord = this.coordService.transformToLongLat(coords);
    this.longitude = transformedCoord[0];
    this.latitude = transformedCoord[1];


  }
}