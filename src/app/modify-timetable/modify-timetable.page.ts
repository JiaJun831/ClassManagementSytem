import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ModalController } from '@ionic/angular';

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
    this.getData('user').then((res) => {
      resJson = JSON.parse(res);
      // console.log(resJson);
      for (let i = 0; i < resJson.module_id.length; i++) {
        this.http
          .get<moduleList>(
            'https://us-central1-attendancetracker-a53a9.cloudfunctions.net/api/classes/module/' +
              resJson.module_id[i]
          )
          .subscribe((data) => {
            this.list.push(data);
          });
      }
    });

    console.log(this.list);
    return this.list;
  }

  async getData(input: string) {
    const { value } = await Storage.get({ key: input });
    return value;
  }

  deleteConfirm() {}
}
