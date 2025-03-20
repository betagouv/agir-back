# Recettes

## Données

Les recettes proviennet d'un
[dump JSON](../src/infrastructure/repository/services_recherche/recettes/data/dump-recipes.2024-09-06.json) 
des données de mangerbouger.fr.

## Images

Les images associées à chaque recettes ont été récupérées en partie depuis le
site de mangerbouger.fr afin d'être retéléchargées depuis shutterstock.com avec
la bonne licence. Elles sont disponibles dans le dossier
`Produit/Services/Recettes Manger Bouger/Shutterstock - images téléchargées` du
drive.

Elles ont été ensuite redimensionnées et converties au format WebP avant d'être
uploadées dans le dossier `services/recettes` de cloudinary.com. C'est le lien
vers ces images qui est utilisé dans le champ `image_url` du payload des
recettes. A noter, que le champ `fallback_image_url` redirige vers les SVGs qui
étaient utilisés avant.

Le nom utilisé correspond au `slug` de la recette.
