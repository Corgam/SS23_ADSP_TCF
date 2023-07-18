import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email = '';
  password = '';
  repeatPassword = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    const success = await this.auth.register(this.email, this.password, this.repeatPassword);
    if (success) {
      this.router.navigate(['auth/login']);
    }
  }
}
