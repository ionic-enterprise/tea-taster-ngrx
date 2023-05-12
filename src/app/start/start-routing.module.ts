import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartPage } from './start.page';

const routes: Routes = [
  {
    path: '',
    component: StartPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StartPageRoutingModule {}
