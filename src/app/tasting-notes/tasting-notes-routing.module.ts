import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/core';
import { TastingNotesPage } from './tasting-notes.page';

const routes: Routes = [
  {
    path: '',
    component: TastingNotesPage,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TastingNotesPageRoutingModule {}
