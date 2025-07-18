import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.scss'
})
export class ResetPasswordComponent {
  resetForm!: FormGroup

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, {
      validators: this.passwordsMatchValidator
    })
  }

  passwordsMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  getError(controlName: string): string | null {
    const control = this.resetForm.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control?.hasError('email')) {
      return 'Formato de correo inválido';
    } else if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    // Revisa si el grupo tiene el error de mismatch y si el control es confirmPassword
    if (controlName === 'confirmPassword' && this.resetForm?.hasError('passwordsMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }
}
