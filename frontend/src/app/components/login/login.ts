import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ResetPasswordModal } from './reset-password-modal/reset-password-modal';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { showErrorToast, showSuccesToast } from '../../toast'

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  isLogin: boolean = true;
  loginForm!: FormGroup;
  signUpForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalService: MatDialog,
    private loginService: LoginService,
    private router: Router
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
            showSuccesToast('Correo enviado', result.message);
          },
          error: (error) => {
            console.error('Error al enviar correo:', error);
            showErrorToast('Error al enviar correo', error.error.message);
          }
        })
      }
    })
  }

  getError(controlName: string): string | null {
    const form = this.isLogin ? this.loginForm : this.signUpForm;
    const control = form.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control?.hasError('email')) {
      return 'Formato de correo inválido';
    } else if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (controlName === 'confirmPassword' && form.hasError('passwordsMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

  signUp() {
    if (this.signUpForm.valid) {
      const { email, password } = this.signUpForm.value;
      this.loginService.signUp(email, password).subscribe({
        next: (result) => {
          this.isLogin = true;
          this.loginForm.patchValue({ email, password });
          this.signUpForm.reset();
          showSuccesToast('Registro completado', result.message);
        },
        error: (error) => {
          console.error('Error al registrarse:', error);
          showErrorToast('Error al registrar usuario', error.error.message);
        }
      });
    }
  }

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.loginService.login(email, password).subscribe({
        next: (result) => {
          this.loginForm.reset();
          showSuccesToast('Acceso Otorgado', result.message);
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000)
        },
        error: (error) => {
          console.error('Error al iniciar sesión:', error);
          showErrorToast('Error al iniciar sesión', error.error.message);
        }
      })
    }
  }
}
