import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { AuthStore } from '../../features/auth/signals/auth.store';

@Component({
 selector: 'app-main-layout',
 standalone: true,
 imports: [
 CommonModule,
 RouterOutlet,
 HeaderComponent,
 SidebarComponent,
 FooterComponent
 ],
 template: `
 <div class="main-layout" [class.main-layout--sidebar-collapsed]="isSidebarCollapsed()">
 <aside class="main-layout__sidebar">
 <app-sidebar 
 [collapsed]="isSidebarCollapsed()"
 (toggle)="toggleSidebar()"
 />
 </aside>
 
 <div class="main-layout__content">
 <header class="main-layout__header">
 <app-header 
 [sidebarCollapsed]="isSidebarCollapsed()"
 (toggleSidebar)="toggleSidebar()"
 />
 </header>
 
 <main class="main-layout__main">
 <router-outlet />
 </main>
 
 <footer class="main-layout__footer">
 <app-footer />
 </footer>
 </div>
 </div>
 `,
 styles: [`
 :host {
 display: block;
 }
 
 .main-layout {
 display: flex;
 min-height: 100vh;
 
 &__sidebar {
 width: var(--sidebar-width);
 flex-shrink: 0;
 background-color: var(--surface-1);
 border-right: var(--border-width-thin) solid var(--color-gray-200);
 transition: width var(--transition-slow);
 position: fixed;
 top: 0;
 left: 0;
 bottom: 0;
 z-index: var(--z-fixed);
 
 @media (max-width: 1023px) {
 transform: translateX(-100%);
 
 .main-layout--sidebar-collapsed & {
 transform: translateX(0);
 width: var(--sidebar-width);
 }
 }
 }
 
 &--sidebar-collapsed &__sidebar {
 width: var(--sidebar-collapsed-width);
 
 @media (max-width: 1023px) {
 width: var(--sidebar-width);
 }
 }
 
 &__content {
 flex: 1;
 display: flex;
 flex-direction: column;
 min-width: 0;
 margin-left: var(--sidebar-width);
 transition: margin-left var(--transition-slow);
 
 @media (max-width: 1023px) {
 margin-left: 0;
 }
 }
 
 &--sidebar-collapsed &__content {
 margin-left: var(--sidebar-collapsed-width);
 
 @media (max-width: 1023px) {
 margin-left: 0;
 }
 }
 
 &__header {
 height: var(--header-height);
 flex-shrink: 0;
 position: sticky;
 top: 0;
 z-index: var(--z-sticky);
 }
 
 &__main {
 flex: 1;
 overflow-y: auto;
 padding: var(--space-6);
 
 @media (min-width: 768px) {
 padding: var(--space-8);
 }
 }
 
 &__footer {
 height: var(--footer-height);
 flex-shrink: 0;
 }
 }
 `]
})
export class MainLayoutComponent {
 private authStore = inject(AuthStore);
 
 // Signals
 isSidebarCollapsed = signal<boolean>(false);
 isMobileMenuOpen = signal<boolean>(false);
 
 // Computed
 user = computed(() => this.authStore.user());
 isAuthenticated = computed(() => this.authStore.isAuthenticated());
 
 // Methods
 toggleSidebar(): void {
 this.isSidebarCollapsed.update(collapsed => !collapsed);
 }
 
 toggleMobileMenu(): void {
 this.isMobileMenuOpen.update(open => !open);
 }
 
 closeMobileMenu(): void {
 this.isMobileMenuOpen.set(false);
 }
 
 logout(): void {
 this.authStore.logout();
 }
}
