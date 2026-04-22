# Side B Project

[English](#english) | [Español](#español)

## English

## Steps to run the project from scratch

1. Install Node.js (Version 18 or higher)
2. Install MongoDB (Local with Mongo Compass or online with MongoDB Atlas)
3. Use an account on the Discogs developers (https://www.discogs.com/developers) page to generate a Personal Access Token (In case the current one doesn't work)
4. Install dependencies by opening a terminal in the root folder of the project and executing:
```bash
npm install
```
5. Configure the .env file in the root folder of the project and place the database credentials
PORT=3000
MONGODB_URI=mongodb://localhost:27017/SideB (or the address of your database)

6. Configure the external API (Discogs)
* In the public/js/apiExterna.js file
* On the line const DISCOGS_TOKEN = "..."
* Replace the value with your personal key

7. Compile the Sass
For all the aesthetics and colors to load correctly, execute the following command:
```bash
npm run build:css
```

8. Run the project with the following command
```bash
npm run dev
```

9. Open the following link in the browser:
```
http://localhost:3000
```

## Español

## Pasos para ejecutar el proyecto desde cero

1. Instalar Node.js (Version 18 o superior)
2. Instalar MongoDB (Local con Mongo Compass o en linea con MongoDB Atlas)
3. Utilizar una cuenta en la pagina de Discogs Developers (https://www.discogs.com/developers) para generar un Personal Access Token (En caso de no funcionar el actual)
4. Instalar dependencias abriendo una terminal en la carpeta raiz del proyecto y ejecutar:
```bash
npm install
```
5. Configurar el archivo .env de la raiz del proyecto y colocar las credenciales de la base de datos
PORT=3000
MONGODB_URI=mongodb://localhost:27017/SideB (o la direccion de tu base de datos)

6. Configurar la API externa (Discogs)
* En el archivo public/js/apiExterna.js
* En la linea const DISCOGS_TOKEN = "..."
* Remplazar el valor por tu clave personal

7. Compilar el Sass
Para que toda la estética y colores se carguen correctamente se ejecuta el siguiente comando: 
```bash
npm run build:css
```

8. Ejecutar el proyecto con el siguiente comando
```bash
npm run dev
```

9. Abrir en el navegador el siguiente enlace:
```
http://localhost:3000
```