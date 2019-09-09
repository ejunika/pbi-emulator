import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  azureAccessToken: string;

  constructor(
    private dataService: DataService,
    private localStorage: LocalStorage,
    private jwtHelperService: JwtHelperService,
    private router: Router
  ) { }

  ngOnInit() {

  }

  login(): void {
    if (!this.jwtHelperService.isTokenExpired(this.azureAccessToken)) {
      this.localStorage.setItem('azureAccessToken', this.azureAccessToken)
        .subscribe((isDone: boolean) => {
          this.router.navigate(['home']);
        });
    }
  }

}
