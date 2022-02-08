import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingPage } from './setting.page';

import { SettingPageRoutingModule } from './setting-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    // RouterModule.forChild([{ path: '', component: SettingPage }]),
    SettingPageRoutingModule,
  ],
  declarations: [SettingPage],
})
export class Tab3PageModule {}
