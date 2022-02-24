import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
@Component({
  selector: 'app-setting',
  templateUrl: 'setting.page.html',
  styleUrls: ['setting.page.scss'],
})
export class SettingPage {
  constructor(public router: Router) {}

  logout() {
    this.router.navigate(['../login']);
    Storage.remove({ key: 'user' });
    Storage.remove({ key: 'role' });
    Storage.remove({ key: 'userID' });
  }
}
