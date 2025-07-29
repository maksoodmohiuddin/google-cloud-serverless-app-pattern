import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmployeeDialogFormComponent } from '../components';
import { DEFAULT_CONFIG, DialogConfig } from 'src/interfaces/dialog-config.interface';
import { Employee } from 'src/interfaces/employee.interface';
import { Store } from '@ngrx/store';
import * as fromStore from '../store';

@Injectable({
  providedIn: 'root'
})
export class CreateEmployeeDialogService {

  // reference to the Employee Dialog Form Component
  dialogRef: MatDialogRef<EmployeeDialogFormComponent>;

  /**
   * Generate a cryptographically secure unique identifier
   * Uses crypto.getRandomValues() for better security than Math.random()
   */
  generateSecureId(): string {
    // Use crypto API if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Generate a UUID-like string with crypto.getRandomValues()
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      
      // Convert to hex string with proper UUID format
      let hex = '';
      for (let i = 0; i < array.length; i++) {
        hex += array[i].toString(16).padStart(2, '0');
      }
      
      // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        '4' + hex.substring(13, 16), // Version 4 UUID
        ((parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hex.substring(17, 20),
        hex.substring(20, 32)
      ].join('-');
    } else {
      // Fallback for older browsers - still better than simple Math.random()
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      const additionalRandom = Math.random().toString(36).substring(2, 15);
      return `emp-${timestamp}-${randomPart}-${additionalRandom}`;
    }
  }

  /**
   * Validate that the generated ID meets security requirements
   */
  private validateGeneratedId(id: string): boolean {
    // Check minimum length
    if (id.length < 10) return false;
    
    // Check that it doesn't contain easily guessable patterns
    const sequentialPattern = /012|123|234|345|456|567|678|789|890|abc|bcd|cde/i;
    if (sequentialPattern.test(id)) return false;
    
    // Check for repeated characters (more than 3 consecutive)
    const repeatedPattern = /(.)\1{3,}/;
    if (repeatedPattern.test(id)) return false;
    
    return true;
  }

  /**
   * Generate a secure, validated employee ID
   */
  generateEmployeeId(): string {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      const id = this.generateSecureId();
      if (this.validateGeneratedId(id)) {
        return id;
      }
      attempts++;
    }
    
    // If all attempts fail, use timestamp-based fallback
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `emp-${timestamp}-${randomSuffix}`;
  }

  constructor(private dialog: MatDialog,
              private store: Store<fromStore.EmployeeState>) {}

  openFormDialog(config?: DialogConfig): void {

    // Override default configuration, if existing
    const dialogConfig = { ... DEFAULT_CONFIG, ... config };

    this.dialogRef = this.dialog.open(EmployeeDialogFormComponent, dialogConfig);

    this.dialogRef.afterClosed()
      .subscribe((data) => {
        // Only process if data is provided and valid
        if (!data) return;
        
        // Validate that required fields are present
        if (!data.firstName || !data.lastName || !data.jobTitle) {
          console.error('Required employee fields are missing');
          return;
        }
        
        const employee: Employee = {
          id: this.generateEmployeeId(), // Use secure ID generation
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle,
          avatarURL: data.avatarURL,
          imageURL: data.imageURL,
          yearsExperience: data.yearsExperience,
          address: {
            city: data.city,
            street: data.street
          }
        };

        // Log the generated ID for debugging (remove in production)
        console.log('Generated secure employee ID:', employee.id);

        this.store.dispatch(fromStore.addEmployee({ employee }));
      });
  }
}
