import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="form-container">
      <h1>Formulario de Producto</h1>
      <p>Esta funcionalidad se implementara en la historia F4</p>
      <a routerLink="/products">← Volver al listado</a>
    </div>
  `,
  styles: [`
    .form-container { padding: 24px; text-align: center; }
    h1 { color: #1e3a5f; margin-bottom: 16px; }
    a { color: #3b82f6; text-decoration: none; }
  `]
})
export class ProductFormComponent {}
