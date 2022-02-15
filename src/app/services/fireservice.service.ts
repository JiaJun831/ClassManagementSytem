import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FireserviceService {
  constructor(
    public firebaseAuthentication: AngularFireAuth,
    public router: Router
  ) {
    this.firebaseAuthentication.authState.subscribe((user) => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }

  loginWithEmail(data) {
    return this.firebaseAuthentication.signInWithEmailAndPassword(
      data.email,
      data.password
    );
  }
}
