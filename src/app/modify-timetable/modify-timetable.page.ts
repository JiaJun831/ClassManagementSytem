import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ModalController } from '@ionic/angular';
import { UpdateTimetableModalComponent } from '../update-timetable-modal/update-timetable-modal.component';

interface moduleList {
  list: Array<any>;
}

@Component({
  selector: 'app-modify-timetable',
  templateUrl: './modify-timetable.page.html',
  styleUrls: ['./modify-timetable.page.scss'],
})
export class ModifyTimetablePage implements OnInit {
  list: any[] = [];
  constructor(
    private http: HttpClient,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    this.getClasses();
  }

  getClasses() {
    let resJson;
    let test = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      for (let i = 0; i < resJson.module_id.length; i++) {
        let parseValue = parseInt(resJson.module_id[i]);
        test += parseValue + ',';
      }
      let data = {
        test: test.substring(0, test.length - 1),
      };
      this.http
        .post(
          'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module',
          data
        )
        .subscribe((data) => {
          for (let i = 0; i < Object.keys(data).length; i++) {
            this.http
              .get(
                'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/modules/' +
                  data[i].data.module_id
              )
              .subscribe((res) => {
                data[i].data.module_name = res['Name'];
              });
          }
          this.list.push(data);
          console.log(this.list);
        });
    });
    return this.list;
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: UpdateTimetableModalComponent,
      // cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }

  deleteConfirm() {}
}
