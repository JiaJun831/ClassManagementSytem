import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Student } from '../interfaces/interface.student';
import { Storage } from '@capacitor/storage';

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
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.formData = new FormGroup({
      AddressLine1: new FormControl('', Validators.required),
      AddressLine2: new FormControl('', Validators.required),
      FirstName: new FormControl('', Validators.required),
      LastName: new FormControl('', Validators.required),
      County: new FormControl('', Validators.required),
      Country: new FormControl('Ireland'),
      EmailControl: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
      MobileNumber: new FormControl('', Validators.required),
      EirCode: new FormControl('', Validators.required),
      DOB: new FormControl('', Validators.required),
    });
    this.getData('user').then((res) => {
      this.user = JSON.parse(res);
      console.log(this.user);
    });
  }

  get errorControl() {
    return this.formData.controls;
  }

  updateStudent() {
    this.isSubmitted = true;
    if (!this.formData.valid) {
      console.log('Please provide all the required values!');
      console.log(this.formData.value);
      return false;
    } else {
      this.http.put<Student>(
        'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/' +
          this.id,
        this.formData.value
      );
    }
    console.log(this.formData.value);
    console.log(this.id);
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}
