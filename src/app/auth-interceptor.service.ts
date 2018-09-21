import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ToasterService } from 'angular2-toaster';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  accessToken: string;

  constructor(
    private localStorage: LocalStorage,
    private toasterService: ToasterService
  ) {
    this.accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imk2bEdrM0ZaenhSY1ViMkMzbkVRN3N5SEpsWSIsImtpZCI6Imk2bEdrM0ZaenhSY1ViMkMzbkVRN3N5SEpsWSJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNzc0YTFmMjEtZWU0Yy00NzZjLThlZDItMDdjOGU4YzJlODk4LyIsImlhdCI6MTUzNzQ0MDEzNSwibmJmIjoxNTM3NDQwMTM1LCJleHAiOjE1Mzc0NDQwMzUsImFjciI6IjEiLCJhaW8iOiJBU1FBMi84SUFBQUFzcHVsbXIwVFdybEIyTE55TEROTnpndkM2MEVZVnA5VVVzWFVuSUlRaWNJPSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiI4NWY3ZDdkMC0yOTRjLTQxMzUtOTU4ZC00MTAwMGJmNGFiM2UiLCJhcHBpZGFjciI6IjAiLCJpcGFkZHIiOiIxMy4xMjcuMjE3LjE3NiIsIm5hbWUiOiJQb3dlckJJIFBybyBBZG1pbiIsIm9pZCI6ImRjZDkxZmQ2LTAzNzQtNGI2Yy1iYzYyLWY5YjRjYzk5MTZjNSIsInB1aWQiOiIxMDAzM0ZGRkFERUYxOTI2Iiwic2NwIjoiQ29udGVudC5DcmVhdGUgRGFzaGJvYXJkLlJlYWQuQWxsIERhdGFzZXQuUmVhZC5BbGwgRGF0YXNldC5SZWFkV3JpdGUuQWxsIEdyb3VwLlJlYWQgR3JvdXAuUmVhZC5BbGwgUmVwb3J0LlJlYWQuQWxsIFJlcG9ydC5SZWFkV3JpdGUuQWxsIFRlbmFudC5SZWFkV3JpdGUuQWxsIiwic3ViIjoiTF85NUFXN0tlR3NEdGFhT3JpdzZJRFNIV04zQV9XMHp0S3lCMmVqLVVjQSIsInRpZCI6Ijc3NGExZjIxLWVlNGMtNDc2Yy04ZWQyLTA3YzhlOGMyZTg5OCIsInVuaXF1ZV9uYW1lIjoiUG93ZXJCSVByb0FkbWluQHBvd2Vyc2Nob29sZW5naW5lZXJpbmcub25taWNyb3NvZnQuY29tIiwidXBuIjoiUG93ZXJCSVByb0FkbWluQHBvd2Vyc2Nob29sZW5naW5lZXJpbmcub25taWNyb3NvZnQuY29tIiwidXRpIjoieTVDRmtQaVFna1dRYVVGUUVrb2FBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYTllYTg5OTYtMTIyZi00Yzc0LTk1MjAtOGVkY2QxOTI4MjZjIl19.IRZcCMkhzBZEyYUin8scw4XC-T7WFN4nNh0wF3WwEgAaEVv-d9275WM-MXargpCBsY01yvl-umuXBg-2q_9fucHSkJOToF0XS_-Zc4LzBbcOSlpCLgzZTlY_xxjuzbQa_vmhs7etMQQPPeGqTM7N4UhgWEDLLXx-NBFR61lrt3BOeE4_WL82znWACqcgDtjKAudQeNbPdaZMNvV-zbo1uEhM1LUJa6hHzVYUY6D5bJg0W8YRKovALC1Ztkq143hMxp2hae6e4luGQ3AVhu1W_bwK5MytXKIC_3HqiNVLOqwQpJ4T5v6zJs48ClCe7ZflW2TtXop__otiBKlGl4JlwA';
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const updatedHeaders: any = { 'Content-Type': 'application/json; charset=UTF-8' };
    return this.localStorage.getItem('azureAccessToken').mergeMap((azureAccessToken) => {
      updatedHeaders.Authorization = 'Bearer ' + azureAccessToken;
      const clonedRequest = request.clone({
        setHeaders: updatedHeaders
      });
      return next.handle(clonedRequest).catch(error => {
        if (error instanceof HttpErrorResponse) {
          switch ((<HttpErrorResponse>error).status) {
            case 401:
              return this.handle401(request, next);
            case 403:
              return this.handle403(request, next);
            default:
              return next.handle(clonedRequest);
          }
        } else {
          return Observable.throw(error);
        }
      });
    });
  }

  handle401(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request);
  }

  handle403(request: HttpRequest<any>, next: HttpHandler) {
    this.toasterService.pop('error', 'Token', 'Token expired');
    return next.handle(request);
  }

}
