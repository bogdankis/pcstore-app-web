import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class PcshopFormService {

  private countriesUrl = environment.pcstoreApiUrl + '/countries';
  private statesUrl = environment.pcstoreApiUrl + '/states';

  constructor(private httpClient: HttpClient ) { }

  getCountries(): Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    )
  }

  getStates(theCountryCode): Observable<State[]>{
    
    
    const searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    
    return this.httpClient.get<GetResponseStates>(searchStateUrl).pipe(
    map(response => response._embedded.states)
  )
  }
  

  //TODO store in array months of the years
  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    //TODO wrap object as observable to receive
    return of(data);
  }
  //TODO store in array months of the years
  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;
    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    //TODO wrap object as observable to receive
    return of(data);
  }
}

interface GetResponseCountries{
  _embedded:{
    countries: Country[];
  }
}
interface GetResponseStates{
  _embedded:{
    states: State[];
  }
}