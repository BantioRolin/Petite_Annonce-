import { InscriptionComponent } from './inscription/inscription.component';
import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/acceuil.component';
import { LoginComponent } from './login/login.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { WorkspaceComponent2 } from './workspace/workspace.component';

 export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'connexion' , component:LoginComponent},
  { path: 'acceuil' , component:AccueilComponent},
  { path: 'annonces' , component:AnnoncesComponent},
  { path: 'workspace' , component:WorkspaceComponent2},
  {
  path: 'annonces/:id/edit',
  loadComponent: () => import('./edit-annonce/edit-annonce.component')
    .then(m => m.EditAnnonceComponent)
}
];