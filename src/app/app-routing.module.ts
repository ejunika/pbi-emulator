import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { HelpComponent } from './help/help.component';
import { AppResolverService } from './app-resolver.service';
import { AuthGuardService } from './auth/auth-guard.service';
import { LoginGuardService } from './auth/login-guard.service';
import { ScriptEditorComponent } from './script-editor/script-editor.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/help',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuardService]
  },
  {
    path: 'home',
    component: HomeComponent,
    resolve: {
      appResolverService: AppResolverService
    },
    canActivate: [AuthGuardService]
  },
  {
    path: 'home/script-editor',
    component: ScriptEditorComponent,
    resolve: {
      appResolverService: AppResolverService
    },
    canActivate: [AuthGuardService]
  },
  {
    path: 'help',
    component: HelpComponent
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
