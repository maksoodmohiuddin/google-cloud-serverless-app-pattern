import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMsg = '';
          if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMsg = `Error: ${error.error.message}`;
          }
          else {
            // Server-side error
            errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
          }
          // Use proper logging instead of console.log
          console.error('HTTP Error:', errorMsg);
          return throwError(() => new Error(errorMsg));
        })
      );
  }
}
