import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl = 'https://localhost:8080/api/orders'

  constructor(private httpClient: HttpClient) { }

  getOrderHistory(theEmail: string): Observable<GetResponseOrderHistroy>{
    // build URL base on customer email
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesecending?email=${theEmail}`;

    return this.httpClient.get<GetResponseOrderHistroy>(orderHistoryUrl);
  }
}

interface GetResponseOrderHistroy {
  _embedded:{
    orders: OrderHistory[];
  }
}
