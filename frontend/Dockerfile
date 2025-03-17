# Utiliser une image de base Node.js
FROM node:23.5.0

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Nettoyer le cache npm et installer les dépendances
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copier le reste des fichiers de l'application
COPY . .

# Set permissions for the entire app directory
RUN chmod -R 777 /app

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev-exposed"]