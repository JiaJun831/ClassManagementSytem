import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  formData: FormGroup;
  id: string;
  isSubmitted = false;
  user = <any>{};

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    this.formData = new FormGroup({
      AddressLine1: new FormControl('', Validators.required),
      AddressLine2: new FormControl(''),
      FirstName: new FormControl('', Validators.required),
      LastName: new FormControl('', Validators.required),
      County: new FormControl('', Validators.required),
      Country: new FormControl('Ireland'),
      MobileNumber: new FormControl('', Validators.required),
      EirCode: new FormControl('', Validators.required),
      DOB: new FormControl('', Validators.required),
      Email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
    });

    this.getData('user').then((res) => {
      this.user = JSON.parse(res);
      this.formData.setValue({
        AddressLine1: this.user.AddressLine1,
        AddressLine2: this.user.AddressLine2,
        FirstName: this.user.FirstName,
        LastName: this.user.LastName,
        County: this.user.County,
        Country: this.user.Country,
        Email: this.user.Email,
        MobileNumber: this.user.MobileNumber,
        EirCode: this.user.EirCode,
        DOB: this.user.DOB,
      });
    });
  }

  get errorControl() {
    return this.formData.controls;
  }

  async updateProfile() {
    this.isSubmitted = true;
    if (!this.formData.valid) {
      const alert = await this.alertController.create({
        header: 'Please provide all the required values!',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
          },
        ],
      });
      await alert.present();
      return false;
    } else {
      this.getData('userID').then((res) => {
        this.getData('role').then((role) => {
          this.http
            .patch(
              `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/${role}s/${res}`,
              this.formData.value
            )
            .subscribe(async (res) => {
              this.http.get(
                `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/${role}s/email/${this.formData.value.Email}`
              );
              const alert = await this.alertController.create({
                header: 'Update Profile Success!',
                buttons: [
                  {
                    text: 'OK',
                    role: 'cancel',
                    handler: () => {
                      this.router.navigate(['../tabs/setting']);
                    },
                  },
                ],
              });
              await alert.present();
            });
        });
      });
    }
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }

  setData(key: string, value: string) {
    // Store the value under "my-key"
    Storage.set({ key: key, value: value });
  }
}
