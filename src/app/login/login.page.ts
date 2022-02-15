import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  id: null;
  student: any;
  lecturer: any;
  constructor(public router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  login() {
    this.http
      .post(
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyC1IMED0fuuCze3BwdGft3beKSiFpZ4zM8',
        this.loginForm.value
      )
      .subscribe((res) => {
        console.log(res);
        // this.router.navigate(['./tabs/home']);
        if (this.loginForm.controls['email'].value.includes('student')) {
          this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/students/email/' +
                this.loginForm.controls['email'].value
            )
            .subscribe((res) => {
              this.student = res;
              setData(res[0].id);
              // getData('userID').then((res) => {
              //   console.log(res);
              // });
            });
        } else {
          this.http
            .get(
              'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/lecturers/email/' +
                this.loginForm.controls['email'].value
            )
            .subscribe((res) => {
              console.log(res);
            });
        }
      });

    function setData(value: string) {
      // Store the value under "my-key"
      Storage.set({ key: 'userID', value: value });
    }

    async function getData(input: string) {
      const { value } = await Storage.get({ key: input });
      return value;
    }
  }
}
