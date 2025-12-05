import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
  link?: string;
}

interface Category {
  icon: string;
  title: string;
  subtitle: string;
}

interface ContactInfo {
  icon: string;
  title: string;
  value: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './acceuil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loadAnnonces();
  }

  loadAnnonces() {
    if (isPlatformBrowser(this.platformId)) {
      const annonces = localStorage.getItem('annonces');
      console.log('Annonces chargées :', annonces);
    } else {
      console.log('LocalStorage indisponible côté serveur');
    }
  }

  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  heroIcons: string[] = [
    'https://i.pinimg.com/1200x/a0/0e/64/a00e641cea95eb9eefe51b8ca720c2eb.jpg',
    'https://i.pinimg.com/1200x/29/47/53/294753a85f2cb9977a95f0691d83637a.jpg',
    'https://i.pinimg.com/736x/bb/07/8b/bb078b787f3e989738b543e033b6af66.jpg',
    'https://i.pinimg.com/1200x/62/d0/8b/62d08b9dae87c130f793aa69a287be76.jpg'
  ];

  features: Feature[] = [
    {
      icon: 'https://i.pinimg.com/736x/d8/32/6d/d8326d84f8dcd4f524dc2b42b96eb612.jpg',
      title: 'Recherche facile',
      description: 'Trouvez rapidement ce que vous cherchez grâce à nos filtres avancés'
    },
    {
      icon: 'https://i.pinimg.com/736x/44/68/9d/44689dd93b9a853418fa6a14d1a4a88c.jpg',
      title: 'Publication simple',
      description: 'Créez vos annonces en quelques clics avec photos et descriptions'
    },
    {
      icon: 'https://i.pinimg.com/736x/22/9e/e8/229ee87e21a530609fda88d4dbd476ec.jpg',
      title: 'Sécurisé',
      description: 'Vos données sont protégées et vos transactions sécurisées'
    },
    {
      icon: 'https://i.pinimg.com/1200x/ee/ff/d0/eeffd08522d2cf0b268b5ddbeb6f0230.jpg',
      title: 'Communication directe',
      description: 'Contactez directement les vendeurs et acheteurs'
    }
  ];

  steps: Step[] = [
    {
      number: 1,
      title: 'Inscrivez-vous',
      description: 'Créez votre compte gratuitement en quelques secondes',
      link: '/inscription'
    },
    {
      number: 2,
      title: 'Publiez une annonce',
      description: 'Ajoutez vos photos, description et informations de contact'
    },
    {
      number: 3,
      title: 'Gérez vos annonces',
      description: 'Modifiez, supprimez ou mettez à jour vos annonces à tout moment'
    },
    {
      number: 4,
      title: 'Connectez-vous',
      description: 'Échangez avec les acheteurs ou vendeurs intéressés'
    }
  ];

  categories: Category[] = [
    {
      icon: 'https://i.pinimg.com/1200x/a0/0e/64/a00e641cea95eb9eefe51b8ca720c2eb.jpg',
      title: 'Immobilier',
      subtitle: 'Vente & Location'
    },
    {
      icon: 'https://i.pinimg.com/1200x/29/47/53/294753a85f2cb9977a95f0691d83637a.jpg',
      title: 'Véhicules',
      subtitle: 'Voitures & Motos'
    },
    {
      icon: 'https://i.pinimg.com/736x/c9/af/6e/c9af6ef0402ed8c4e0f8192da64f809e.jpg',
      title: 'Électronique',
      subtitle: 'High-tech & Informatique'
    },
    {
      icon: 'https://i.pinimg.com/736x/90/fd/b6/90fdb6fc953101fde228ae051b7bca7d.jpg',
      title: 'Emploi',
      subtitle: 'Offres d\'emploi'
    },
    {
      icon: 'https://i.pinimg.com/736x/8e/e2/a8/8ee2a836d795d7b8155b4214000d5a4e.jpg',
      title: 'Meubles',
      subtitle: 'Maison & Décoration'
    },
    {
      icon: 'https://i.pinimg.com/1200x/89/47/5d/89475d9a656d38564cd6d02ce9abd48d.jpg',
      title: 'Loisirs',
      subtitle: 'Sports & Hobbies'
    }
  ];

  contactInfos: ContactInfo[] = [
    {
      icon: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
      title: 'Email',
      value: 'contact@petitesannonces.com'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/512/724/724664.png',
      title: 'Téléphone',
      value: '+237 680 31 22 41'
    },
    {
      icon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      title: 'Adresse',
      value: 'Bamenda, Cameroun'
    }
  ];

  onSubmitContact(): void {
    if (this.contactForm.name && this.contactForm.email && this.contactForm.message) {
      console.log('Formulaire soumis:', this.contactForm);
      alert('Message envoyé avec succès!');
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
