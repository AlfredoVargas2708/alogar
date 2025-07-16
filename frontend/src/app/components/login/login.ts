import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ResetPasswordModal } from './reset-password-modal/reset-password-modal';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // * Variables
  isLogin: boolean = true;
  loginForm!: FormGroup;
  signUpForm!: FormGroup;

  // * Constructor
  constructor(private fb: FormBuilder, private modalService: MatDialog) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required, Validators.email],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.signUpForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  // * Validador de contraseñas iguales
  passwordsMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  openRestartModal() {
    this.modalService.open(ResetPasswordModal, {
      width: '400px',
      height: '250px'
    });
  }

}
