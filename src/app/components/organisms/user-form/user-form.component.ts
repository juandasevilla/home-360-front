import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/shared/models/User';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  userForm!: FormGroup;
  isSubmitting = false;
  
  nameMaxLength = 50;
  lastNameMaxLength = 50;
  phoneMaxLength = 13;
  emailMaxLength = 100;
  passwordMaxLength = 30;
  
  maxBirthDate: string;
  
  roles = [
    { id: 2, name: 'Vendedor' }
  ];

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private toastr: ToastrService
  ) {
    // Establecer la fecha máxima (18 años atrás desde hoy)
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    this.maxBirthDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  ngOnInit(): void {
    this.initForm();
  }

  
  initForm(): void {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(this.nameMaxLength)]],
      lastName: ['', [Validators.required, Validators.maxLength(this.lastNameMaxLength)]],
      identification: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      phone: ['', [
        Validators.required, 
        Validators.maxLength(this.phoneMaxLength),
        Validators.pattern(/^(\+?[0-9]{1,12})$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.maxLength(this.emailMaxLength),
        Validators.email // Validación de formato de email
      ]],
      password: ['', [
        Validators.required, 
        Validators.maxLength(this.passwordMaxLength),
        Validators.minLength(8) // Mínimo 8 caracteres
      ]],
      birthDate: ['', [
        Validators.required,
        this.validateBirthDate.bind(this) // Validación personalizada
      ]],
      roleId: [null, Validators.required]
    });
  }

  get nameCharsRemaining(): number {
    const currentLength = this.userForm.get('name')?.value?.length || 0;
    return this.nameMaxLength - currentLength;
  }
  
  get descriptionCharsRemaining(): number {
    const currentLength = this.userForm.get('lastName')?.value?.length || 0;
    return this.lastNameMaxLength - currentLength;
  }
  
  get phoneCharsRemaining(): number {
    const currentLength = this.userForm.get('phone')?.value?.length || 0;
    return this.phoneMaxLength - currentLength;
  }
  
  get emailCharsRemaining(): number {
    const currentLength = this.userForm.get('email')?.value?.length || 0;
    return this.emailMaxLength - currentLength;
  }
  
  get passwordCharsRemaining(): number {
    const currentLength = this.userForm.get('password')?.value?.length || 0;
    return this.passwordMaxLength - currentLength;
  }

  hasError(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (field.errors['maxlength']) {
      const maxLength = 
        fieldName === 'name' ? this.nameMaxLength :
        fieldName === 'lastName' ? this.lastNameMaxLength :
        fieldName === 'phone' ? this.phoneMaxLength :
        fieldName === 'email' ? this.emailMaxLength :
        this.passwordMaxLength;
      
      return `Máximo ${maxLength} caracteres`;
    }
    
    if (field.errors['minlength'] && fieldName === 'password') {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (field.errors['pattern']) {
      if (fieldName === 'phone') {
        return 'Formato de teléfono inválido. Use números o un + al inicio ';
      }
      if (fieldName === 'identification') {
        return 'Formato de identificación inválido. Solo números';
      }
      return 'Formato inválido';
    }
    
    if (field.errors['email']) {
      return 'Correo electrónico inválido';
    }
    
    
    if (fieldName === 'birthDate') {
      if (field.errors['future']) {
        return 'La fecha no puede ser futura';
      }
      if (field.errors['minAge']) {
        return 'Debes tener al menos 18 años';
      }
      if (field.errors['maxAge']) {
        return 'La edad máxima permitida es 100 años';
      }
    }
    
    return 'Campo inválido';
  }

  
  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // La validación required ya manejará este caso
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 18); // Mínimo 18 años

    if (birthDate > today) {
      return { future: true }; // No se permiten fechas futuras
    }

    if (birthDate > minAgeDate) {
      return { minAge: true }; // Debe tener al menos 18 años
    }

    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(today.getFullYear() - 100); // Máximo 100 años

    if (birthDate < maxAgeDate) {
      return { maxAge: true }; // Máximo 100 años
    }

    return null; // La fecha es válida
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;

    const formData = this.userForm.value;
    const userData: User = {
      name: formData.name,
      lastName: formData.lastName,
      identification: Number(formData.identification),
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      birthDate: formData.birthDate,
      roleId: Number(formData.roleId)
    };

    this.userService.createUser(userData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Mostrar mensaje de éxito con Toastr
        this.toastr.success('Usuario creado exitosamente', 'Éxito');
        
        // Reiniciar el formulario
        this.userForm.reset({
          roleId: null
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        
        // Mostrar mensaje de error con Toastr
        this.toastr.error(
          error.error?.message || 'Ocurrió un error al crear el usuario', 
          'Error'
        );
      }
    });
  }
}

