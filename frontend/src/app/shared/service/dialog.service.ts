import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Datafile, NotRefDataFile, RefDataFile } from '@common/types';
import { DataDisplayDialogComponent } from '../data-display/data-display-dialog/data-display-dialog.component';
@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private readonly dialog: MatDialog) { }

  openDisplayDataDialog(datafile: RefDataFile | NotRefDataFile){
    this.dialog.open(DataDisplayDialogComponent, {
      data: {datafile},
    });

  }
}
