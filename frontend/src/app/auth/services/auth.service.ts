import { Injectable, inject } from '@angular/core';
import {
  Auth,
  user,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  AuthError,
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  user$ = user(this.auth);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (error) {
      if ((error as AuthError).code != null)
        this.handleAuthError(error as AuthError);
      return false;
    }
  }

  async register(email: string, password: string, repeatPassword: string) {
    if (password != repeatPassword) {
      this.handleAuthError('auth/password-mismatch');
      return false;
    }

    try {
      const user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return true;
    } catch (error) {
      if ((error as AuthError).code != null)
        this.handleAuthError(error as AuthError);
      return false;
    }
  }

  async resetPassword(email: string) {
    try {
      const user = await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      if ((error as AuthError).code != null)
        this.handleAuthError(error as AuthError);
      return false;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/auth/login']);
      return true;
    } catch (error) {
      if ((error as AuthError).code != null)
        this.handleAuthError(error as AuthError);
      return false;
    }
  }

  handleAuthError(error: AuthError | string) {
    error = typeof error == 'string' ? error : error.code;
    console.log(error);
    switch (error) {
      case 'auth/missing-email':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
      case 'auth/email-already-in-use':
      case 'auth/missing-password':
      case 'auth/weak-password':
      case 'auth/password-mismatch':
      case 'auth/wrong-password':
        this.showErrorSnack(
          this.translate.instant('auth.error.' + error.split('/')[1])
        );
        break;
      default:
        this.showErrorSnack(this.translate.instant('auth.error.unknown'));
        break;
    }
  }

  showErrorSnack(errorMessage: string) {
    this.snackBar.open(
      errorMessage,
      this.translate.instant('auth.error.dismiss'),
      {
        duration: 5000,
        panelClass: ['theme-snackbar-error'],
      }
    );
  }
}
