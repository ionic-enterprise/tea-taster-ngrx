import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/core';
import { TeaPage } from './tea.page';

const routes: Routes = [
  {
    path: '',
    component: TeaPage,
    canActivate: [authGuard],
  },
  {
    path: 'tea-details',
    loadChildren: () => import('../tea-details/tea-details.module').then((m) => m.TeaDetailsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaPageRoutingModule {}
