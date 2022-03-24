import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-update-timetable-modal',
  templateUrl: './update-timetable-modal.component.html',
  styleUrls: ['./update-timetable-modal.component.scss'],
})
export class UpdateTimetableModalComponent {
  constructor(
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

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
          handler: () => {
            // update function
          },
        },
      ],
    });

    await alert.present();
  }
}
