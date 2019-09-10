import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  requestCount = 0;

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService,
    private spinnerService: NgxSpinnerService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinnerService.show();
    this.requestCount++;
    const updatedHeaders: any = { 'Content-Type': 'application/json; charset=UTF-8' };
    return this.localStorage.getItem('azureAccessToken').mergeMap((azureAccessToken) => {
      updatedHeaders.Authorization = 'Bearer ' + azureAccessToken;
      const clonedRequest = request.clone({
        setHeaders: updatedHeaders
      });
      return next.handle(clonedRequest)
        .catch((error: any) => {
          if (error instanceof HttpErrorResponse) {
            switch ((error).status) {
              case 401:
                return this.handle401(request, next);
              case 403:
                return this.handle403(request, next, error.error);
              case 500:
                return this.handle500(request, next);
              default:
                return next.handle(clonedRequest);
            }
          } else {
            return Observable.throw(error);
          }
        })
        .do((event: any) => {
          if (event instanceof HttpResponse) {
            this.requestCount--;
            if (this.requestCount == 0)
              this.spinnerService.hide();
          }
        })
    });
  }

  handle401(request: HttpRequest<any>, next: HttpHandler) {
    this.toasterService.pop('error', 'Authentication', 'Un Authorized token');
    return next.handle(request);
  }

  handle403(request: HttpRequest<any>, next: HttpHandler, error: any) {
    let e: any = error ? error.error || { code: 'UnknownError', message: 'UnknownError' } : { code: 'UnknownError', message: 'UnknownError' };
    this.toasterService.pop('error', e.code, e.message);
    if (e && e.code === 'TokenExpired' || e.code === 'UnknownError') {
      this.spinnerService.hide();
      this.router.navigate(['login']);
    }
    return next.handle(request);
  }

  handle500(request: HttpRequest<any>, next: HttpHandler) {
    this.toasterService.pop('error', 'Server', 'Internal Server Error');
    return next.handle(request);
  }

}
