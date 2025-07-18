import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmenmt } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) { }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${environmenmt.apiUrl}/users/reset-password`, { email, newPassword })
  }
}
