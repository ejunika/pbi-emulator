import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocalStorageModule, localStorageProviders } from '@ngx-pwa/local-storage';
import { ToasterModule } from 'angular2-toaster';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { JwtModule, JwtHelperService } from "@auth0/angular-jwt";
import { NgxSpinnerModule } from "ngx-spinner";

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { DataService } from './data.service';
import { AuthInterceptorService } from './auth-interceptor.service';
import { LeftpanelComponent } from './leftpanel/leftpanel.component';
import { MainpanelComponent } from './mainpanel/mainpanel.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { GroupService } from './group.service';
import { HelpComponent } from './help/help.component';
import { EzUtilModule } from './ez-util/ez-util.module';
import { ConfirmDialogService } from './confirm-dialog.service';
import { AppUtilService } from './app-util.service';
import { AppResolverService } from './app-resolver.service';
import { AuthService } from './auth/auth.service';
import { AuthGuardService } from './auth/auth-guard.service';
import { LoginGuardService } from './auth/login-guard.service';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    LeftpanelComponent,
    MainpanelComponent,
    LoginComponent,
    HelpComponent
  ],
  entryComponents: [
    LeftpanelComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    LocalStorageModule,
    AngularFontAwesomeModule,
    EzUtilModule,
    JwtModule.forRoot({
      config: {}
    }),
    ToasterModule.forRoot(),
    NgxSpinnerModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  providers: [
    DataService,
    AppUtilService,
    AppResolverService,
    ConfirmDialogService,
    AuthService,
    JwtHelperService,
    AuthGuardService,
    LoginGuardService,
    GroupService,
    localStorageProviders({ prefix: 'myapp' }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
