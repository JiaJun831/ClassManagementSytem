import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  subscription: any;
  private loading;

  constructor(
    public router: Router,
    private http: HttpClient,
    public alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthServiceService
  ) {
    this.getData('user').then((res) => {
      if (res != null) {
        this.router.navigate(['../tabs/home']);
      }
    });
  }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }
  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }

  login() {
    this.loadingController
      .create({
        message: 'Authenticating....',
      })
      .then((overlay) => {
        this.loading = overlay;
        this.loading.present();
      });

    this.http
      .post(
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyC1IMED0fuuCze3BwdGft3beKSiFpZ4zM8',
        this.loginForm.value
      )
      .subscribe(
        async (res) => {
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
                this.loading.dismiss();
                this.router.navigate(['../tabs/home']);
              });
          } else {
            this.http
              .get(
                'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/lecturers/email/' +
                  this.loginForm.controls['email'].value.toLowerCase()
              )
              .subscribe(async (res) => {
                this.setData('userID', res[0].id);
                this.setData('user', JSON.stringify(res[0].data));
                this.setData('course', res[0].data.module_id);
                this.setData('role', 'lecturer');
                this.loading.dismiss();
                this.router.navigate(['../tabs/home']);
              });
          }
        },
        async (error) => {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Login Failed',
            message: 'Email or Password is incorrect!',
            buttons: ['Ok'],
          });
          await alert.present();
        }
      );
  }

  setData(key: string, value: string) {
    // Store the value under "my-key"
    Storage.set({ key: key, value: value });
  }
}
