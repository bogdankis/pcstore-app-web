import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private oktaAuth: OktaAuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAcces(request, next));
  }
 private async handleAcces(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>>{

  // Only add an acces token for secured endpoints
  const thisEndPoint = environment.pcstoreApiUrl + '/orders'
  const securedEndpoints = [thisEndPoint];

  if (securedEndpoints.some(url => request.urlWithParams.includes(url))){

    // get acces  token
    const accessToken = await this.oktaAuth.getAccessToken(); // wait for the async call to finish
  

  // clone the request and add new header with acces token
  request = request.clone({
    setHeaders: {
      Authorization: 'Bearer ' + accessToken
    }
  });

}
return next.handle(request).toPromise();
}

}

