import { Component, Inject } from '@angular/core';
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
  title: string;
  description: string;
  tags: string[];

  constructor(
    public dialogRef: MatDialogRef<ContinueJourneyDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: Journey
  ) {
    this.title = data.title || '';
    this.description = data.description || '';
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

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close({
      title: this.title,
      description: this.description,
      tags: this.tags,
    });
  }
}
