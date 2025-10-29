// Test file with intentional issues for AI review testing
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval } from 'rxjs';

@Component({
  selector: 'app-test',
  template: `
    <div [innerHTML]="userContent"></div>
    <div>{{ userData }}</div>
  `
})
export class TestComponent implements OnInit {
  userContent: string;
  userData: any;
  private dataSubject = new Subject();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Memory leak: interval never unsubscribed
    interval(1000).subscribe(val => {
      console.log(val);
    });
  }

  // Security issue: SQL injection vulnerability
  loadUserData(userId: string) {
    const query = "SELECT * FROM users WHERE id = " + userId;
    return this.http.get('/api/query?sql=' + query);
  }

  // Security issue: XSS vulnerability
  displayUserContent(content: string) {
    this.userContent = content; // Rendered with innerHTML - XSS risk!
  }

  // Performance issue: no change detection strategy
  // Should use OnPush for better performance

  // Architecture issue: direct database access from component
  saveUser(user: any) {
    const sql = `INSERT INTO users VALUES ('${user.name}', '${user.email}')`;
    return this.http.post('/api/execute', { sql });
  }

  // RxJS issue: Subject not completed on destroy
  ngOnDestroy() {
    // Missing: this.dataSubject.complete();
  }

  // Security issue: sensitive data in console
  debugUser(user: any) {
    console.log('User password:', user.password);
  }
}
