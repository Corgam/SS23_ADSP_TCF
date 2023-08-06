import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Journey } from '@common/types';

export interface InputDialogData {
  label: string;
  value: string;
  placeholder: string;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './continue-journey-dialog.component.html',
  styleUrls: ['./continue-journey-dialog.component.scss'],
})
export class ContinueJourneyDialogComponent {
  titleControl: FormControl;
  descriptionControl: FormControl;
  tags: string[];

  constructor(
    public dialogRef: MatDialogRef<ContinueJourneyDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: Journey
  ) {
    this.titleControl = new FormControl(data.title || '', [
      Validators.required,
      Validators.minLength(3),
    ]);
    this.descriptionControl = new FormControl(data.description || '', [
      Validators.required,
      Validators.minLength(3),
    ]);
    this.tags = data.tags || [];
  }

  removeTag(tag: string) {
    const index = this.tags.findIndex((t) => t == tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  addTag(event: MatChipInputEvent) {
    let tag = (event.value || '').trim();
    this.tags.push(tag);
    event.chipInput!.clear();
  }

  getControlErrorMessage(control: FormControl) {
    if (control.hasError('required'))
      return 'continueJourneyDialog.requiredError';
    if (control.hasError('minlength'))
      return 'continueJourneyDialog.minLengthError';
    return '';
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close({
      title: this.titleControl.value,
      description: this.descriptionControl.value,
      tags: this.tags,
    });
  }
}
