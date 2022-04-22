import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@capacitor/storage';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-attendance-modal',
  templateUrl: './attendance-modal.component.html',
  styleUrls: ['./attendance-modal.component.scss'],
})
export class AttendanceModalComponent implements OnInit {
  @Input() student_id;
  @Input() course_id;
  overallYearAttendance: number;
  overallWeekAttendance: number;
  attendanceList: any[] = [];
  constructor(
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getStudentAttendanceYear();
    this.getStudentAttendanceWeek();
    this.getStudentModuleAttendance();
  }
  dismissModal() {
    this.modalController.dismiss();
  }

  getStudentAttendanceYear() {
    this.http
      .get(
        `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/updateAttendance/timetables/attendance/${this.student_id}`
      )
      .subscribe((res) => {
        this.overallYearAttendance = parseInt(res.toString());
      });
    return this.overallYearAttendance;
  }

  async getStudentAttendanceWeek() {
    await this.getData('timetableDate').then((week) => {
      this.http
        .get(
          `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/updateAttendance/timetables/weekly/attendance/${this.student_id}/${week}`
        )
        .subscribe((res) => {
          this.overallWeekAttendance = parseInt(res.toString());
        });
    });

    return this.overallWeekAttendance;
  }

  async getStudentModuleAttendance() {
    let course = [];
    let promises = [];
    for (let i = 0; i < this.course_id.length; i++) {
      let p = this.http
        .get(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/modules/' +
            this.course_id[i]
        )
        .toPromise();
      promises.push(p);
    }

    let count = 0;

    await Promise.all(promises).then((res) => {
      for (let p of res) {
        p.Id = this.course_id[count];
        count++;
        course.push(p);
      }
    });

    let promises2 = [];
    for (let i = 0; i < course.length; i++) {
      let p = this.http
        .get(
          `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/updateAttendance/timetables/attendance/${this.student_id}/${course[i].Id}`
        )
        .toPromise();
      promises2.push(p);
    }

    console.log(course);
    let count2 = 0;
    await Promise.all(promises2)
      .then((res) => {
        for (let p of res) {
          course[count2].attendance = p.percentage;
          count2++;
        }
      })
      .catch((err) => {
        console.log(err);
      });
    this.attendanceList = course;
    return this.attendanceList;
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}
