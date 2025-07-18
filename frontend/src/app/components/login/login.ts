import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ResetPasswordModal } from './reset-password-modal/reset-password-modal';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from '../../services/login.service';

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
  constructor(
    private fb: FormBuilder,
    private modalService: MatDialog,
    private loginService: LoginService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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
    const dialogRef = this.modalService.open(ResetPasswordModal, {
      width: '400px',
      height: '250px'
    });

    dialogRef.afterClosed().subscribe(email => {
      if (email) {
        this.loginService.sendResetPassword(email).subscribe({
          next: (result) => {
            console.log(result);
          },
          error: (error) => {
            console.error('Error al enviar correo:', error);
          }
        })
      }
    })
  }

  getError(controlName: string): string | null {
    const control = this.isLogin ? this.loginForm.get(controlName) : this.signUpForm.get(controlName);
    console.log(control?.errors);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control?.hasError('email')) {
      return 'Formato de correo inválido';
    } else if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    } else if (control?.hasError('passwordsMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

}
