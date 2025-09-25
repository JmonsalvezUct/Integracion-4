## 📌 FastPlanner - Gestor de Tareas Colaborativo - Grupo 9 - Taller de integración 4

Integrantes: Sion Arancibia (Scrum master), Javier Monsalvez, Leonardo Placeres y Agustín Monsalve.

## 🛠️ Requisitos previos  

Asegúrate de tener instalado:  
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

## Instalación api 

- git clone git@github.com:JmonsalvezUct/Integracion-4.git
- cd integracion-4/api
- npm install

- Crea un .env en api/ y copia el archivo .env.example a .env (no olvides configurar las variables)

- npm run db:reset
- npm run db:generate
- npm run db:migrate
- npm run db:seed
- npm run dev



### 🚀 Setup app Mobile

Asegúrate de tener instalado:

* **Expo Go** app en tu dispositivo móvil (iOS o Android) o **Expo Go** en un simulador/emulador.
* **Node.js** (versión lts)

### Instalación

npm install

3.  **Inicia el proyecto:**

npm run android

4.  **Ejecuta la aplicación:**
    * **En tu dispositivo móvil:** Escanea el código QR con la aplicación **Expo Go**.
    * **En simulador/emulador:** Presiona `i` para iOS o `a` para Android en la terminal donde se ejecuta el proceso de `npm start`.

---
## 🛠 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:
* `npm run android`: Abre la app en un emulador o dispositivo Android (requiere configuración).
* `npm run ios`: Abre la app en un simulador o dispositivo iOS (requiere macOS).
* `npm run web`: Ejecuta la app en el navegador como una aplicación web.

---