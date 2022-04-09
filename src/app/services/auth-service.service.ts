import { Injectable, NgZone } from '@angular/core';
import * as auth from 'firebase/auth';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { PushNotifications } from '@capacitor/push-notifications';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor(
    public firebaseAuthentication: AngularFireAuth,
    public router: Router
  ) {
    this.firebaseAuthentication.authState.subscribe((user) => {
      if (user) {
        this.router.navigate(['/tabs/home']);
      }
    });
  }

  loginWithEmail(data) {
    return this.firebaseAuthentication.signInWithEmailAndPassword(
      data.email,
      data.password
    );
  }

  logout() {
    this.firebaseAuthentication.signOut().then(() => {});
  }
}
