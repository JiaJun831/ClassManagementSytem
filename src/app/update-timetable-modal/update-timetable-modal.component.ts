import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-update-timetable-modal',
  templateUrl: './update-timetable-modal.component.html',
  styleUrls: ['./update-timetable-modal.component.scss'],
})
export class UpdateTimetableModalComponent implements OnInit {
  @Input() class_id: number;
  @Input() module_id: number;
  updateForm: FormGroup;
  isSubmitted = false;
  day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log(this.class_id);
    console.log(this.module_id);
    this.updateForm = new FormGroup({
      classroom: new FormControl('', Validators.required),
      dayIndex: new FormControl('1'),
      end_time: new FormControl('10:00', Validators.required),
      start_time: new FormControl('09:00', Validators.required),
      day: new FormControl(),
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async presentAlertRadio() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header:
        'Do you want to change only this occurrence of the event, or this and all future occurrences?',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'Only This Week',
          value: 'week',
          checked: false,
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'All Future Classes',
          value: 'all',
          checked: false,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Ok',
          handler: (alertData) => {
            this.updateClass(alertData);
          },
        },
      ],
    });

    await alert.present();
  }

  get errorControl() {
    return this.updateForm.controls;
  }

  async updateClass(updateWeek: String) {
    this.isSubmitted = true;
    if (!this.updateForm.valid) {
      console.log('Please provide all the required values!');
      return false;
    } else {
      const startTime = this.updateForm.value.start_time.split('T');
      const endTime = this.updateForm.value.end_time.split('T');
      const startValue = startTime[1].substring(0, 5);
      const endValue = endTime[1].substring(0, 5);
      if (startValue > endValue) {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header:
            'We dont have a time machine, your end time should not be earlier than your start time.',
          buttons: [
            {
              text: 'Ok',
              role: 'cancel',
              cssClass: 'secondary',
            },
          ],
        });
        await alert.present();
      } else {
        const updateDate = {
          module_id: this.module_id,
          timeslot: {
            start_time: startValue,
            classroom: this.updateForm.value.classroom,
            dayIndex: parseInt(this.updateForm.value.dayIndex),
            end_time: endValue,
            day: this.day[this.updateForm.value.dayIndex - 1],
          },
        };
        console.log(updateDate);
        if (updateWeek == 'week') {
          this.http
            .post(
              `https://us-entral1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/${this.startOfTheWeek()}/${
                this.class_id
              }`,
              { newClass: updateDate }
            )
            .subscribe((res) => {
              console.log(res);
            });
        } else {
          this.http.post(
            `https://us-entral1-attendancetracker-a53a9.cloudfunctions.net/api/timetables/default/${this.class_id}`,
            { newClass: updateDate }
          );
        }
      }
    }
  }

  startOfTheWeek() {
    const today = new Date();
    const lastSunday = today.getDate() - today.getDay();
    const sunday = new Date(today.setDate(lastSunday)).toJSON();
    const dateOnly = sunday.split('T');
    const date = dateOnly[0];
    return date;
  }
}
