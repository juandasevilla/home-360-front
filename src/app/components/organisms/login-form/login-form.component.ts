import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Login } from 'src/app/shared/models/Login';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm!: FormGroup;
  isSubmitting: boolean = false;
  emailMaxLength: number = 50;
  passwordMaxLength: number = 50;
  private readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.initForm();
  } 

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, 
        Validators.maxLength(this.emailMaxLength), Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(this.passwordMaxLength)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;

    const loginData: Login = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.toastr.success('Login successful');
        const userRole = this.authService.getUserRole();
        if (userRole === 'ADMIN') {
          this.router.navigate(['admin/dashboard']);
        } else if (userRole === 'SELLER') {
          this.router.navigate(['seller/dashboard']);
        }
        else {
          this.router.navigate(['buyer/dashboard']);
        }
        
      },
      error: (error) => {
        this.toastr.error('Login failed');
        console.error(error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (!control || !control.errors) {
      return '';
    }
    
    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
    return `Debe tener máximo ${control.errors['maxlength'].requiredLength} caracteres`; // Corregido
    }

    if (control.errors['email'] || control.errors['pattern']) {
      return 'El formato del email no es válido. Debe ser ej usuario@dominio.com';
    }
    
    return 'Campo inválido';
  }

}
