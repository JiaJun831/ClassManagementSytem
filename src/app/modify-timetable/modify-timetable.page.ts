import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { LoadingController, ModalController } from '@ionic/angular';
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
  private loading;

  constructor(
    private http: HttpClient,
    public modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.load();
  }

  getClasses() {
    let resJson;
    let text = '';
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      for (let i = 0; i < resJson.module_id.length; i++) {
        let parseValue = parseInt(resJson.module_id[i]);
        text += parseValue + ',';
      }
      let data = {
        text: text.substring(0, text.length - 1),
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
          this.loading.dismiss();
          console.log(this.list);
        });
    });
    return this.list;
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: UpdateTimetableModalComponent,
    });
    return await modal.present();
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }

  load() {
    this.loadingController
      .create({
        message: 'Loading Data....',
      })
      .then((overlay) => {
        this.loading = overlay;
        this.loading.present();
      });
    this.getClasses();
  }
}
