import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from '../common/payment-info';
import { Purchase } from '../common/purchase';



@Injectable({
  providedIn: 'root'
})
export class CheckoutService { 

  private purchaseUrl = environment.pcstoreApiUrl + '/checkout/purchase';

  private paymentIntentUrl = environment.pcstoreApiUrl + '/checkout/payment-intent';

  constructor(private httpCLient: HttpClient) { }

  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpCLient.post<Purchase>(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any>{
    return this.httpCLient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo)
  }
  
}

