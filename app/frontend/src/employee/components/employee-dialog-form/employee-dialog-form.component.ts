import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataInterface } from 'src/interfaces/employee.interface';
import { UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';

// Custom validators for enhanced security
export class CustomValidators {
  
  // Validate employee ID format (alphanumeric, hyphens, underscores only)
  static employeeId(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;
    const valid = /^[a-zA-Z0-9_-]+$/.test(control.value);
    return valid ? null : { 'invalidEmployeeId': true };
  }

  // Validate no HTML/script tags (XSS protection)
  static noHtml(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;
    const hasHtml = /<[^>]*>/g.test(control.value);
    return hasHtml ? { 'containsHtml': true } : null;
  }

  // Validate years of experience range
  static yearsRange(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;
    const years = parseInt(control.value);
    if (isNaN(years) || years < 0 || years > 50) {
      return { 'invalidYearsRange': true };
    }
    return null;
  }

  // Validate URL format (basic validation)
  static urlFormat(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;
    try {
      new URL(control.value);
      return null;
    } catch {
      return { 'invalidUrl': true };
    }
  }
}

@Component({
  selector: 'app-employee-dialog-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-dialog-form.component.html',
  styleUrls: ['./employee-dialog-form.component.scss']
})
export class EmployeeDialogFormComponent implements OnInit {

  form: UntypedFormGroup;
  
  // Validation constants matching backend
  readonly MAX_STRING_LENGTH = 255;
  readonly MAX_YEARS_EXPERIENCE = 50;
  
  jobTitles: string[] = [
    'Analyst',
    'Associate Partner',
    'Client Delivery Lead',
    'Cloud Architect',
    'Cloud Engineer',
    'Partner',
    'Program Manager',
    'Project Manager',
    'Senior Cloud Architect',
    'Senior Cloud Engineer',
    'Senior Partner',
    'Senior Project Manager',
    'TBD'
  ];

  constructor(private fb: UntypedFormBuilder,
              private dialogRef: MatDialogRef<EmployeeDialogFormComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DataInterface) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [
        this.data.currentEmployee ? this.data.currentEmployee.firstName : '',
        [
          Validators.required,
          Validators.maxLength(this.MAX_STRING_LENGTH),
          Validators.pattern(/^[a-zA-Z\s'-]+$/), // Only letters, spaces, hyphens, apostrophes
          CustomValidators.noHtml
        ]
      ],
      lastName: [
        this.data.currentEmployee ? this.data.currentEmployee.lastName : '',
        [
          Validators.required,
          Validators.maxLength(this.MAX_STRING_LENGTH),
          Validators.pattern(/^[a-zA-Z\s'-]+$/),
          CustomValidators.noHtml
        ]
      ],
      jobTitle: [
        this.data.currentEmployee ? this.data.currentEmployee.jobTitle : '',
        [Validators.required]
      ],
      city: [
        this.data.currentEmployee?.address?.city ? this.data.currentEmployee.address.city : '',
        [
          Validators.maxLength(this.MAX_STRING_LENGTH),
          CustomValidators.noHtml
        ]
      ],
      street: [
        this.data.currentEmployee?.address?.street ? this.data.currentEmployee.address.street : '',
        [
          Validators.maxLength(this.MAX_STRING_LENGTH),
          CustomValidators.noHtml
        ]
      ],
      avatarURL: [
        this.data.currentEmployee ? this.data.currentEmployee.avatarURL : '',
        [
          Validators.maxLength(this.MAX_STRING_LENGTH),
          CustomValidators.urlFormat
        ]
      ],
      imageURL: [
        this.data.currentEmployee ? this.data.currentEmployee.imageURL : '',
        [
          Validators.maxLength(this.MAX_STRING_LENGTH),
          CustomValidators.urlFormat
        ]
      ],
      yearsExperience: [
        this.data.currentEmployee ? this.data.currentEmployee.yearsExperience : '',
        [
          Validators.min(0),
          Validators.max(this.MAX_YEARS_EXPERIENCE),
          CustomValidators.yearsRange
        ]
      ]
    });
  }

  // Getter methods for template error checking
  get firstNameErrors() {
    const control = this.form.get('firstName');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'First name is required';
      if (control.errors['maxlength']) return `First name must be less than ${this.MAX_STRING_LENGTH} characters`;
      if (control.errors['pattern']) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
      if (control.errors['containsHtml']) return 'First name cannot contain HTML tags';
    }
    return null;
  }

  get lastNameErrors() {
    const control = this.form.get('lastName');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Last name is required';
      if (control.errors['maxlength']) return `Last name must be less than ${this.MAX_STRING_LENGTH} characters`;
      if (control.errors['pattern']) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      if (control.errors['containsHtml']) return 'Last name cannot contain HTML tags';
    }
    return null;
  }

  get jobTitleErrors() {
    const control = this.form.get('jobTitle');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Job title is required';
    }
    return null;
  }

  get yearsExperienceErrors() {
    const control = this.form.get('yearsExperience');
    if (control?.errors && control.touched) {
      if (control.errors['min']) return 'Years of experience cannot be negative';
      if (control.errors['max']) return `Years of experience cannot exceed ${this.MAX_YEARS_EXPERIENCE}`;
      if (control.errors['invalidYearsRange']) return `Years of experience must be between 0 and ${this.MAX_YEARS_EXPERIENCE}`;
    }
    return null;
  }

  get avatarUrlErrors() {
    const control = this.form.get('avatarURL');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) return `Avatar URL must be less than ${this.MAX_STRING_LENGTH} characters`;
      if (control.errors['invalidUrl']) return 'Please enter a valid URL';
    }
    return null;
  }

  get imageUrlErrors() {
    const control = this.form.get('imageURL');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) return `Image URL must be less than ${this.MAX_STRING_LENGTH} characters`;
      if (control.errors['invalidUrl']) return 'Please enter a valid URL';
    }
    return null;
  }

  get cityErrors() {
    const control = this.form.get('city');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) return `City must be less than ${this.MAX_STRING_LENGTH} characters`;
      if (control.errors['containsHtml']) return 'City cannot contain HTML tags';
    }
    return null;
  }

  get streetErrors() {
    const control = this.form.get('street');
    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) return `Street must be less than ${this.MAX_STRING_LENGTH} characters`;
      if (control.errors['containsHtml']) return 'Street cannot contain HTML tags';
    }
    return null;
  }

  // Method to check if form can be submitted
  canSubmit(): boolean {
    return this.form.valid;
  }

  // Sanitize form data before submission
  getSanitizedFormData() {
    const rawData = this.form.value;
    
    // Basic sanitization (HTML encoding handled by backend)
    Object.keys(rawData).forEach(key => {
      if (typeof rawData[key] === 'string') {
        // Trim whitespace
        rawData[key] = rawData[key].trim();
        // Remove any remaining HTML tags as extra protection
        rawData[key] = rawData[key].replace(/<[^>]*>/g, '');
      }
    });

    return rawData;
  }
}

