import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewAttendancePage } from './view-attendance.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAttendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAttendancePageRoutingModule {}
