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
  overallAttendance: number;
  constructor(
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getStudentAttendance();
  }
  dismissModal() {
    this.modalController.dismiss();
  }

  getStudentAttendance() {
    this.http
      .get(
        `https://us-central1-attendancetracker-a53a9.cloudfunctions.net/updateAttendance/timetables/attendance/${this.student_id}`
      )
      .subscribe((res) => {
        console.log(typeof res);
        this.overallAttendance = parseInt(res.toString());
      });
    return this.overallAttendance;
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }
}
