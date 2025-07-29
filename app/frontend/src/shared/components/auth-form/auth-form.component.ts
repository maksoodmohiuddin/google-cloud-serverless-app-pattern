import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Custom password validator
export class PasswordValidators {
  
  // Strong password validation
  static strong(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;
    
    const password = control.value;
    const hasMinLength = password.length >= 8;
    const hasMaxLength = password.length <= 128;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const noSpaces = !/\s/.test(password);
    
    const valid = hasMinLength && hasMaxLength && hasUpperCase && hasLowerCase && 
                  hasNumeric && hasSpecialChar && noSpaces;
    
    if (!valid) {
      const errors: any = {};
      if (!hasMinLength) errors.minLength = true;
      if (!hasMaxLength) errors.maxLength = true;
      if (!hasUpperCase) errors.missingUpperCase = true;
      if (!hasLowerCase) errors.missingLowerCase = true;
      if (!hasNumeric) errors.missingNumeric = true;
      if (!hasSpecialChar) errors.missingSpecialChar = true;
      if (!noSpaces) errors.containsSpaces = true;
      return errors;
    }
    
    return null;
  }
  
  // Check for common weak passwords
  static notCommon(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;
    
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    const password = control.value.toLowerCase();
    const isCommon = commonPasswords.some(common => password.includes(common));
    
    return isCommon ? { 'commonPassword': true } : null;
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'auth-form',
  styleUrls: ['auth-form.component.scss'],
  templateUrl: 'auth-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthFormComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  constructor(private fb: UntypedFormBuilder) {}

  @Input()
  showPasswordInput: boolean;

  @Output()
  submitted = new EventEmitter<UntypedFormGroup>();

  @Output()
  formIsValid = new EventEmitter<boolean>();

  form = this.fb.group({
    email: [
      '', 
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(254) // RFC compliant max length
      ]
    ],
    password: [
      '', 
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        PasswordValidators.strong,
        PasswordValidators.notCommon
      ]
    ]
  });

  ngOnInit(): void {
    this.form.reset();
    this.onChanges();
  }

  onSubmit() {
    if (this.form.valid) {
      // Sanitize form data before emission
      const sanitizedForm = { ...this.form };
      const emailValue = this.form.get('email')?.value?.trim()?.toLowerCase();
      const passwordValue = this.form.get('password')?.value;
      
      // Basic email sanitization
      if (emailValue) {
        sanitizedForm.patchValue({ email: emailValue });
      }
      
      // Password is already validated, no need to modify
      this.submitted.emit(sanitizedForm);
      this.form.reset(this.form.value);
    }
  }

  get passwordInvalid() {
    const control = this.form.get('password');
    return control?.hasError('required') && control.touched;
  }

  get emailFormat() {
    const control = this.form.get('email');
    return control?.hasError('email') && control.touched;
  }

  // Enhanced error messages for password
  get passwordErrors() {
    const control = this.form.get('password');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Password is required';
      if (control.errors['minLength']) return 'Password must be at least 8 characters long';
      if (control.errors['maxLength']) return 'Password must be less than 128 characters';
      if (control.errors['missingUpperCase']) return 'Password must contain at least one uppercase letter';
      if (control.errors['missingLowerCase']) return 'Password must contain at least one lowercase letter';
      if (control.errors['missingNumeric']) return 'Password must contain at least one number';
      if (control.errors['missingSpecialChar']) return 'Password must contain at least one special character';
      if (control.errors['containsSpaces']) return 'Password cannot contain spaces';
      if (control.errors['commonPassword']) return 'Password is too common, please choose a stronger password';
    }
    return null;
  }

  // Enhanced error messages for email
  get emailErrors() {
    const control = this.form.get('email');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email']) return 'Please enter a valid email address';
      if (control.errors['maxlength']) return 'Email address is too long';
    }
    return null;
  }

  // Check if form can be submitted
  get canSubmit(): boolean {
    return this.form.valid;
  }

  onChanges(): void {
    this.subscription = this.form.statusChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(status => status === 'INVALID' ? this.formIsValid.emit(false) : this.formIsValid.emit(true));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
