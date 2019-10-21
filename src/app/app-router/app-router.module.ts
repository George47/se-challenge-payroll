import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

/**
 * Put your componenets here that relate to your routes
 */
// eg
import { HomeComponent } from '../views/home/home.component';

// let's set the main routes
const routes: Routes = [
    // this is the main screen after the app has been installed
    { path: '', component: HomeComponent },

    // fallback to a specific route
    { path: '**', redirectTo: ''}
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRouterModule { }
