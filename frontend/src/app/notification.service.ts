import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Service, which allows the display of notification.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

  showInfo(text: string) {
    this.snackBar.open(text, 'Okay', { duration: 3000})
  }
}
