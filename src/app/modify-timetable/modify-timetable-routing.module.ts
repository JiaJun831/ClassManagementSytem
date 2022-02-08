import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModifyTimetablePage } from './modify-timetable.page';

const routes: Routes = [
  {
    path: '',
    component: ModifyTimetablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModifyTimetablePageRoutingModule {}
