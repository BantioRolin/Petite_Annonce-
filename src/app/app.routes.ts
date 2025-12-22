import { InscriptionComponent } from './inscription/inscription.component';
import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/acceuil.component';
import { LoginComponent } from './login/login.component';
import { AnnoncesComponent } from './annonces/annonces.component';

 export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'connexion' , component:LoginComponent},
  // alias route for English/other code that navigates to '/login'
  { path: 'login', component: LoginComponent },
  { path: 'acceuil' , component:AccueilComponent},
  { path: 'annonces' , component:AnnoncesComponent},
{
  path: 'dashboard',
  loadComponent: () => import('.//workspace/workspace.component')
    .then(m => m.WorkspaceComponent)
},
  {
  path: 'annonces/:id/edit',
  loadComponent: () => import('./edit-annonce/edit-annonce.component')
    .then(m => m.EditAnnonceComponent)
}
];