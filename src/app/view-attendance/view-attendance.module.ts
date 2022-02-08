import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewAttendancePageRoutingModule } from './view-attendance-routing.module';

import { ViewAttendancePage } from './view-attendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAttendancePageRoutingModule
  ],
  declarations: [ViewAttendancePage]
})
export class ViewAttendancePageModule {}
