import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  subscription: any;

  constructor(
    public router: Router,
    private http: HttpClient,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribeWithPriority(
      9999,
      () => {
        // do nothing
      }
    );
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  login() {
    this.http
      .post(
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyC1IMED0fuuCze3BwdGft3beKSiFpZ4zM8',
        this.loginForm.value
      )
      .subscribe((res) => {
        if (this.loginForm.controls['email'].value.includes('student')) {
          this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/students/email/' +
                this.loginForm.controls['email'].value.toLowerCase()
            )
            .subscribe((res) => {
              this.setData('userID', res[0].id);
              this.setData('user', JSON.stringify(res[0].data));
              this.setData('role', 'student');
              this.router.navigate(['../tabs/home']);
            });
        } else {
          this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/lecturers/email/' +
                this.loginForm.controls['email'].value.toLowerCase()
            )
            .subscribe((res) => {
              this.setData('userID', res[0].id);
              this.setData('user', JSON.stringify(res[0].data));
              this.setData('role', 'lecturer');
              this.router.navigate(['../tabs/home']);
            });
        }
      });
  }

  setData(key: string, value: string) {
    // Store the value under "my-key"
    Storage.set({ key: key, value: value });
  }
}
