import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { HelpComponent } from './help/help.component';
import { ConfirmDialogService } from './confirm-dialog.service';
import { AppResolverService } from './app-resolver.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/help',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    resolve: {
      appResolverService: AppResolverService
    }
  },
  {
    path: 'help',
    component: HelpComponent,
    resolve: {
      appResolverService: AppResolverService
    },
    canActivate: [
      ConfirmDialogService
    ],
    canDeactivate: [ConfirmDialogService]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
