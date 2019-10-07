import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  azureAccessToken: string;

  constructor(
    private localStorage: LocalStorage,
    private jwtHelperService: JwtHelperService,
    private router: Router,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {

  }

  login(): void {
    try {
      if (this.azureAccessToken ) {
        if (!this.jwtHelperService.isTokenExpired(this.azureAccessToken)) {
          this.localStorage.setItem('azureAccessToken', this.azureAccessToken)
            .subscribe((isDone: boolean) => {
              this.router.navigate(['home']);
            });
        } else {
          this.toasterService.pop('error', 'Authentication', 'It looks like token is expired');
        }
      } else {
        this.toasterService.pop('error', 'Authentication', 'Please provide a valid token');
      }
    } catch (error) {
      this.toasterService.pop('error', 'Authentication', 'Invalid token');
    }
  }

}
