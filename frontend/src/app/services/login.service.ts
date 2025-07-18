import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmenmt } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {}

  sendResetPassword(email: string):Observable<any> {
    return this.http.post(`${environmenmt.apiUrl}/emails/restart`, { email })
  }
}
