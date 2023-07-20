import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  email = '';

  constructor(private auth: AuthService, private router: Router) {}

  async resetPassword() {
    const success = await this.auth.resetPassword(this.email);
    if (success) {
      this.router.navigate(['/auth/login']);
    }
  }
}
