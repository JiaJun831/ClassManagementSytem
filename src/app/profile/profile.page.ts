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
      AddressLine2: new FormControl(''),
      FirstName: new FormControl('', Validators.required),
      LastName: new FormControl('', Validators.required),
      County: new FormControl('', Validators.required),
      Country: new FormControl('Ireland'),
      CourseID: new FormControl(''),
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
      this.formData.patchValue({
        AddressLine1: this.user.AddressLine1,
        AddressLine2: this.user.AddressLine2,
        FirstName: this.user.FirstName,
        LastName: this.user.LastName,
        County: this.user.County,
        Email: this.user.Email,
        MobileNumber: this.user.MobileNumber,
        EirCode: this.user.EirCode,
        DOB: this.user.DOB,
        CourseID: this.user.CourseID,
      });
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
      this.getData('userID').then((res) => {
        console.log(this.formData.value);
        this.http
          .put<Student>(
            // 'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/students/' +
            'http://localhost:5000/attendancetracker-a53a9/us-central1/api/students/' +
              res,
            this.formData.value
          )
          .subscribe((res) => {
            console.log(res);
          });
        // console.log('success');
      });
    }
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}
