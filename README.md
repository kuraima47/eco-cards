# Cartes Dynamiques

## Lancement des Conteneurs Docker
Pour build les conteneurs Docker en mode détaché :
```sh
docker-compose up -d --build
```
Pour démarrer les conteneurs Docker en mode détaché :
```sh
docker-compose up -d
```

## Arrêt des Conteneurs Docker
Pour arrêter les conteneurs :
```sh
docker-compose down
```

Pour arrêter les conteneurs et supprimer les volumes associés :
```sh
docker-compose down -v
```

## Accès à la Base de Données (DB)
Pour entrer dans le conteneur PostgreSQL et accéder à la base de données :
```sh
docker exec -it ecocards-postgres psql -U postgres -d ecocards-db
```

## Documentation de l'API (Swagger)
Accessible via :
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Configuration des Fichiers d'Environnement (Frontend & Backend)
Ajoutez deux fichiers `.env` avec la structure suivante :

### Backend (`backend/.env`)
```env
PORT=[PORT]
DATABASE_URL="[URL]"

# Modifier CORS_ORIGIN pour l'URL déployée
CORS_ORIGIN="[URL_FRONT]" # Exemple : http://localhost:3001/

JWT_SECRET=[TOKEN]
JWT_EXPIRATION_TIME=3600  # Recommandé

# Compte Gmail obligatoire
EMAIL="[EMAIL]"
# Google exige que la vérification en deux étapes soit activée pour générer des mots de passe d’application, si vous obtenez un message du type : Le paramètre que vous recherchez n'est pas disponible pour votre compte. Rechercher sur google "Activer la validation en deux étapes" pour faire vérifier votre compte
PASSWORD="[PASSWORD]"  # Générer un mot de passe d'application Gmail
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=[URL_API_BACKEND]  # Exemple : http://localhost:3000/api
```

## Choix de l'Environnement (Développement / Production)
Créer un fichier `.env` à la racine et définir :
```env
NODE_ENV=development  # ou NODE_ENV=production
```

