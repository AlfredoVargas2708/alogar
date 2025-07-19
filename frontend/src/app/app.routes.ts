import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.Login),
        title: 'Iniciar Sesión'
    },
    {
        path: 'reset-password/:email',
        loadComponent: () => import('./components/reset-password-component/reset-password-component').then(m =>  m.ResetPasswordComponent),
        title: 'Restablecer Contraseña'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
        title: 'Inicio'
    }
];
