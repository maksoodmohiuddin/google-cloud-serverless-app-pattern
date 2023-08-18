import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from 'src/interfaces/employee.interface';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {


  addEmployeeUrl = 'https://employee-gateway-#.#.gateway.dev/employee';
  employeesUrl = 'https://employee-gateway-#.#.gateway.dev/employees';
  deleteEmployeeUrl = 'https://employee-gateway-#.#.gateway.dev/employee';

  constructor(private http: HttpClient) { }

  employees: Employee[];

  getEmployees(): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(this.employeesUrl);
  }

  addEmployee(employee: Employee): Observable<any> {
    return this.http
      .post(this.addEmployeeUrl, { ...employee });
  }

  deleteEmployee(id: string): Observable<any> {
    const deleteUrl = this.deleteEmployeeUrl + '?id=' + id;
    return this.http
      .delete(deleteUrl);
  }
}


