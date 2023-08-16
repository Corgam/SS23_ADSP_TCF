import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map, startWith } from 'rxjs';
import { NotificationService } from 'src/app/notification.service';
import { ApiService } from 'src/app/shared/service/api.service';
import { SupportedDatasetFileTypes } from '../../../../../common/types/supportedFileTypes';


/**
 * The Component includes the upload of datasets.
 *
 * Sources:
 * We use the components and examples from https://material.angular.io/components/categories.
 * In particular, we use and adopted the code from:
 * https://material.angular.io/components/chips/examples#chips-autocomplete for the keyword input
 * https://material.angular.io/components/select/overview for the dropdown
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
  steps = 1;

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

  uploadError = false;

  @ViewChild('dataTextArea') dataTextArea?: ElementRef<HTMLTextAreaElement>;

  @ViewChild('keywordInput') keywordInput?: ElementRef<HTMLInputElement>;

  constructor(private apiService: ApiService, private router: Router, private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService, private translate: TranslateService) {
    this.filteredKeywords = this.keywordFormControl.valueChanges.pipe(
      startWith(null),
      map((keyword: string | null) => (keyword ? this.filter(keyword) : this.availablePredefinedKeywords.slice())),
    );

    if (router.url.startsWith("/upload-dataset/simra")) {
      this.datasetType = SupportedDatasetFileTypes.SIMRA;
      this.acceptFileFormat = ""; //Simra files can have no ending, .txt, or .csv
    } else if (router.url.startsWith("/upload-dataset/cerv2")) {
      this.datasetType = SupportedDatasetFileTypes.CERV2;
      this.acceptFileFormat = ".nc";
    } else if (router.url.startsWith("/upload-dataset/csv")) {
      this.datasetType = SupportedDatasetFileTypes.CSV;
      this.acceptFileFormat = ".csv";
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
    //The PrimeNG upload compont only allows the correct file type for the other data set types.
    if((this.datasetType === SupportedDatasetFileTypes.SIMRA && !['', 'text/plain', 'text/csv'].some(type => this.file?.type === type) )
      || this.file === undefined){
      this.uploadError = true;
      return false;
    }

    return this.file != null && this.datasetType != null;
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.availablePredefinedKeywords.filter(keyword => keyword.toLowerCase().includes(filterValue));
  }

  /** Creates a new data files */
  uploadData() {
    if (!this.formIsValid()) {
      return;
    }

    this.isLoading = true;

    this.apiService.createDatasetFromFile(this.file!, this.datasetType!, this.selectedKeywords, this.description, this.steps).subscribe({
      next: () => {
        this.resetForm();
        this.isLoading = false;
        const creationSuccessfull = this.translate.instant('createUpdateDatafile.creationSuccess');
        this.notificationService.showInfo(creationSuccessfull);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const errorMsg = this.translate.instant('createUpdateDatafile.error');
        this.notificationService.showInfo(errorMsg);
      }
    });
  }

  onUpload(event: any) {
    this.file = event.files[0];
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

  private setTitle() {
    if (this.title == null && this.file != null) {
      this.title = this.file.name.split(".").shift();
    }
  }
}
