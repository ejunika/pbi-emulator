import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocalStorageModule, localStorageProviders } from '@ngx-pwa/local-storage';
import { ToasterModule } from 'angular2-toaster';

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
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    LocalStorageModule,
    BrowserAnimationsModule,
    EzUtilModule,
    ToasterModule.forRoot()
  ],
  providers: [
    DataService,
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
