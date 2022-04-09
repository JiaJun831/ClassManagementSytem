import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { Storage } from '@capacitor/storage';
import { ModalController } from '@ionic/angular';
import { AttendanceModalComponent } from '../attendance-modal/attendance-modal.component';
@Component({
  selector: 'app-view-attendance',
  templateUrl: './view-attendance.page.html',
  styleUrls: ['./view-attendance.page.scss'],
})
export class ViewAttendancePage implements OnInit {
  constructor(
    private http: HttpClient,
    private modalController: ModalController
  ) {}

  studentList = new Map();
  key = 0;
  ngOnInit() {
    this.getAllStudents();
  }

  getAllStudents() {
    this.http
      .get(
        'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/getStudentModuleList'
      )
      .subscribe((result) => {
        this.getData('user').then((res) => {
          let resJson = JSON.parse(res);
          let lecturerModuleList = resJson.module_id;
          for (let i = 0; i < Object.keys(result).length; i++) {
            for (let j = 0; j < lecturerModuleList.length; j++) {
              if (
                Object.values(result)[i].data.CourseID.includes(
                  parseInt(lecturerModuleList[j])
                )
              ) {
                this.studentList.set(
                  Object.values(result)[i].id,
                  Object.values(result)[i].data
                );
              }
            }
          }
        });
      });

    return this.studentList;
  }

  async openModal(student_id: number) {
    let modal = await this.modalController.create({
      component: AttendanceModalComponent,
      componentProps: {
        student_id: student_id,
      },
    });
    modal.onDidDismiss().then((res) => {
      // this.getData('timetableDate').then((date) => {
      //   this.list = [];
      //   this.load(date);
      // });
    });
    return await modal.present();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}
