import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/core';
import { TeaDetailsPage } from './tea-details.page';

const routes: Routes = [
  {
    path: ':id',
    component: TeaDetailsPage,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaDetailsPageRoutingModule {}
