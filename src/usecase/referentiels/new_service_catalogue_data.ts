import { NewServiceDefinition } from '../../domain/bibliotheque_services/newServiceDefinition';
import { ServiceRechercheID } from '../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { ServiceAsyncID } from '../../domain/bibliotheque_services/serviceAsyncID';
import { ServiceExterneID } from '../../domain/bibliotheque_services/serviceExterneID';
import { Thematique } from '../../domain/contenu/thematique';

const new_service_catalogue: NewServiceDefinition[] = [
  {
    id: ServiceRechercheID.fruits_legumes,
    external_url: 'https://impactco2.fr/outils/fruitsetlegumes',
    icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/cerise.webp',
    titre: 'Fruits et légumes de saison',
    sous_titre: 'dynamic data',
    thematique: Thematique.alimentation,
    is_available_inhouse: true,
  },
  {
    id: ServiceRechercheID.longue_vie_objets,
    external_url: 'https://longuevieauxobjets.ademe.fr/',
    icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/commerce.webp',
    titre: 'Que faire de mes objets ?',
    sous_titre: 'donner, réparer, recycler,...',
    thematique: Thematique.consommation,
    is_available_inhouse: true,
  },
  /*
  {
    id: ServiceAsyncID.linky,
    external_url: 'https://www.winter-energies.fr/',
    icon_url:
      'https://res.cloudinary.com/dq023imd8/image/upload/v1727275914/Screenshot_2024_09_25_at_16_51_08_876426bef9.png',
    titre: 'Votre consommation électrique',
    sous_titre: 'Conseils et suivi',
    thematique: Thematique.logement,
    is_available_inhouse: true,
  },
  */
  {
    id: ServiceRechercheID.proximite,
    external_url: 'https://presdecheznous.fr/map#/carte/{CODE_POSTAL}',
    icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/commerce.webp',
    titre: 'Mes commerces de proximité',
    sous_titre: 'À {COMMUNE}',
    thematique: Thematique.alimentation,
    is_available_inhouse: true,
  },
  {
    id: ServiceRechercheID.recettes,
    external_url:
      'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/recettes',
    icon_url: 'https://agir-front-dev.osc-fr1.scalingo.io/omelette.webp',
    titre: 'Recettes saines et équilibrées',
    sous_titre: 'Bas carbone',
    thematique: Thematique.alimentation,
    is_available_inhouse: true,
  },
  {
    id: ServiceExterneID.poisson_de_saison,
    external_url: 'dynamic data',
    icon_url:
      'https://www.mangerbouger.fr/var/mb/storage/images/_aliases/reference/9/9/9/1/11999-1-eng-GB/Poissons@3x.png',
    titre: 'Poissons de saison',
    sous_titre: 'Manger Bouger',
    thematique: Thematique.alimentation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.compost_local,
    external_url: 'https://reseaucompost.org/annuaire/geocompost-la-carte',
    icon_url: 'https://reseaucompost.org/themes/custom/rcc/logo.svg',
    titre: 'Où composter proche de chez moi ?',
    sous_titre: 'Réseau Compost Citoyen',
    thematique: Thematique.alimentation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.changer_voiture,
    external_url:
      'https://jechangemavoiture.gouv.fr/jcmv/simulateur/#/vehicule',
    icon_url:
      'https://jechangemavoiture.gouv.fr/jcmv/simulateur/assets/img/marianne-64.png',
    titre: 'Quel véhicule pour remplacer le mien ?',
    sous_titre: 'Je change ma voiture',
    thematique: Thematique.transport,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.velo_tourisme,
    external_url: 'https://www.francevelotourisme.com/itineraire',
    icon_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Logo_France_V%C3%A9lo_Tourisme.jpg/320px-Logo_France_V%C3%A9lo_Tourisme.jpg',
    titre: 'Voyager à vélo en France',
    sous_titre: 'France vélo tourisme',
    thematique: Thematique.transport,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.impact_co2,
    external_url: 'https://impactco2.fr/outils/comparateur',
    icon_url:
      'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3d/Logo_Impact_CO2.svg/320px-Logo_Impact_CO2.svg.png',
    titre: 'Comparateur carbone',
    sous_titre: 'Impact CO2',
    thematique: Thematique.climat,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.je_veux_aider,
    external_url: 'https://www.jeveuxaider.gouv.fr/missions-benevolat',
    icon_url:
      'https://www.jeveuxaider.gouv.fr/_nuxt/jeveuxaider-logo.5c6a563b.svg',
    titre: 'Devenir bénévole',
    sous_titre: 'Je veux aider',
    thematique: Thematique.climat,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.aide_reno,
    external_url: 'https://mesaidesreno.beta.gouv.fr/',
    icon_url:
      'https://mesaidesreno.beta.gouv.fr/_next/static/media/logo.6655b6e6.svg',
    titre: 'Estimer mes aides à la rénovation',
    sous_titre: 'Mes Aides Reno',
    thematique: Thematique.logement,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.conso_eau,
    external_url:
      'https://www.cieau.com/le-metier-de-leau/usages-consommation-conseils/calculateur-consommation-eau-annuelle/',
    icon_url:
      'https://www.cieau.com/wp-content/themes/understrap-child/img/cieau_logo_header.png',
    titre: `Estimer ma conso d'eau`,
    sous_titre: 'Cieau',
    thematique: Thematique.logement,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.pacoupas,
    external_url: 'https://pacoupa.ademe.fr/',
    icon_url: 'https://pacoupa.ademe.fr/_next/static/media/hero.849dfaf7.svg',
    titre: `Changer son chauffage`,
    sous_titre: 'Pacoupa',
    thematique: Thematique.logement,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.reparerabilite,
    external_url:
      'https://epargnonsnosressources.gouv.fr/indice-de-reparabilite/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/09/picto_reparabilite_desktop-115.png',
    titre: `Mon appareil se répare-t-il facilement ?`,
    sous_titre: 'Epargnons nos ressources',
    thematique: Thematique.consommation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.labels,
    external_url:
      'https://epargnonsnosressources.gouv.fr/labels-environnementaux/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/09/outils_index-des-labels_icon_desktop_115x95.png',
    titre: `Se repérer dans les labels`,
    sous_titre: 'Epargnons nos ressources',
    thematique: Thematique.consommation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.diagnostiquer,
    external_url:
      'https://epargnonsnosressources.gouv.fr/diagnostic-pannes-appareils/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/10/icons-outils_diagnostique.png',
    titre: `Diagnostiquer une panne`,
    sous_titre: 'Epargnons nos ressources',
    thematique: Thematique.consommation,
    is_available_inhouse: false,
  },
  {
    id: ServiceExterneID.reparer,
    external_url: 'https://epargnonsnosressources.gouv.fr/tutos-reparation/',
    icon_url:
      'https://epargnonsnosressources.gouv.fr/wp-content/uploads/2023/09/picto_tutoreparation_desktop_115x95.png',
    titre: `Tutos pour réparer mes objets`,
    sous_titre: 'Epargnons nos ressources',
    thematique: Thematique.consommation,
    is_available_inhouse: false,
  },
];
module.exports = new_service_catalogue;
