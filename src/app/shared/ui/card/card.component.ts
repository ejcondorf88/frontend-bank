import { Component, input, contentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      @if (hasHeader || title()) {
        <div class="card__header">
          @if (title()) {
            <h3 class="card__title">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="card__subtitle">{{ subtitle() }}</p>
          }
          <ng-content select="[cardHeader]"></ng-content>
        </div>
      }
      
      <div class="card__body">
        <ng-content></ng-content>
      </div>
      
      @if (hasFooter) {
        <div class="card__footer">
          <ng-content select="[cardFooter]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .card {
      background-color: var(--surface-1);
      border: var(--border-width-thin) solid var(--color-gray-200);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: box-shadow var(--transition-fast);
      
      &:hover {
        box-shadow: var(--shadow-md);
      }
      
      &--flat {
        box-shadow: none;
        
        &:hover {
          box-shadow: none;
        }
      }
      
      &--bordered {
        border-width: var(--border-width-medium);
      }
      
      &--clickable {
        cursor: pointer;
        
        &:hover {
          border-color: var(--primary);
        }
      }
      
      &__header {
        padding: var(--space-6);
        border-bottom: var(--border-width-thin) solid var(--color-gray-200);
      }
      
      &__title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin: 0;
      }
      
      &__subtitle {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin: var(--space-1) 0 0 0;
      }
      
      &__body {
        padding: var(--space-6);
      }
      
      &__footer {
        padding: var(--space-4) var(--space-6);
        border-top: var(--border-width-thin) solid var(--color-gray-200);
        background-color: var(--surface-2);
      }
    }
  `]
})
export class CardComponent {
  // Inputs
  title = input<string>('');
  subtitle = input<string>('');
  variant = input<'default' | 'flat' | 'bordered'>('default');
  clickable = input<boolean>(false);

  // Content children
  hasHeader = false;
  hasFooter = false;

  ngAfterContentInit(): void {
    // Detect projected content
    this.hasHeader = !!this.title() || !!this.subtitle();
  }

  // Computed classes
  cardClasses = () => {
    const classes = ['card'];
    
    if (this.variant() === 'flat') {
      classes.push('card--flat');
    }
    
    if (this.variant() === 'bordered') {
      classes.push('card--bordered');
    }
    
    if (this.clickable()) {
      classes.push('card--clickable');
    }
    
    return classes.join(' ');
  };
}
