## Pasos para ejecutar el proyecto desde cero

1. Instalar Node.js (Version 18 o superior)
2. Instalar MongoDB (Local con Mongo Compass o en linea con MongoDB Atlas)
3. Utilizar una cuenta en la pagina de devs de Discogs para generar un Personal Access Token (En caso de no funcionar el actual)
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