# Usa la imagen oficial de Node.js como base
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json al contenedor
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todos los archivos del proyecto al directorio de trabajo del contenedor
COPY . .

# Establece las variables de entorno necesarias
ENV NODE_ENV=production

# Expone el puerto que tu aplicación usará (opcional, para propósitos de documentación)
# No es realmente necesario para Discord.js, ya que no abre un puerto
EXPOSE 8080

# Comando para ejecutar tu aplicación
CMD ["npm", "start"]