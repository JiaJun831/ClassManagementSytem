import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModifyTimetablePageRoutingModule } from './modify-timetable-routing.module';

import { ModifyTimetablePage } from './modify-timetable.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModifyTimetablePageRoutingModule
  ],
  declarations: [ModifyTimetablePage]
})
export class ModifyTimetablePageModule {}
