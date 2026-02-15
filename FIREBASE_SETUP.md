# Configuración del Panel de Administración con Firebase

## 📋 Descripción

Este sistema permite al dueño de la inmobiliaria gestionar todas las propiedades desde un panel web, sin necesidad de programación. Incluye:

- ✅ Autenticación segura con Firebase
- ✅ Panel de administración intuitivo
- ✅ Crear, editar y eliminar propiedades
- ✅ Subida de imágenes automática
- ✅ Base de datos en tiempo real
- ✅ Sincronización automática con el sitio web

## 🚀 Configuración de Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Ingresa el nombre: **Daver Inmobiliaria**
4. Desactiva Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

### Paso 2: Configurar Firebase Authentication

1. En el menú lateral, ve a **Authentication** (Compilación > Authentication)
2. Haz clic en "Comenzar"
3. En la pestaña "Sign-in method":
   - Habilita **Correo electrónico/Contraseña**
   - Guarda los cambios

### Paso 3: Crear Usuario Administrador

1. En Authentication, ve a la pestaña **Users**
2. Haz clic en "Agregar usuario"
3. Ingresa:
   - Correo electrónico: `admin@daver.com` (o el que prefieras)
   - Contraseña: Crea una contraseña segura
4. Guarda el usuario

### Paso 4: Configurar Firestore Database

1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona modo: **Producción**
4. Elige la ubicación: **us-east1** (o la más cercana)
5. Haz clic en "Habilitar"

6. Configura las reglas de seguridad:
   - Ve a la pestaña **Reglas**
   - Reemplaza el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer propiedades
    match /properties/{property} {
      allow read: if true; // Lectura pública para el sitio web
      allow write, update, delete: if request.auth != null; // Solo usuarios autenticados pueden escribir
    }
  }
}
```

7. Haz clic en "Publicar"

### Paso 5: Configurar Storage

1. En el menú lateral, ve a **Storage**
2. Haz clic en "Comenzar"
3. Selecciona modo: **Producción**
4. Usa la misma ubicación que Firestore
5. Haz clic en "Listo"

6. Configura las reglas de Storage:
   - Ve a la pestaña **Rules**
   - Reemplaza el contenido con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{propertyId}/{allPaths=**} {
      allow read: if true; // Lectura pública
      allow write: if request.auth != null; // Solo usuarios autenticados
    }
  }
}
```

7. Haz clic en "Publicar"

### Paso 6: Obtener Credenciales de Firebase

1. Ve a **Configuración del proyecto** (ícono de engranaje junto a "Descripción general del proyecto")
2. En la sección "Tus apps", haz clic en el ícono **</>** (Web)
3. Ingresa el nombre: **Daver Admin Panel**
4. NO marques Firebase Hosting (por ahora)
5. Haz clic en "Registrar app"
6. **COPIA** el objeto `firebaseConfig` que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### Paso 7: Actualizar la Configuración en tu Sitio

Necesitas reemplazar `firebaseConfig` en estos 4 archivos:

1. **admin-login.html** (línea ~85)
2. **admin-panel.html** (línea ~468)
3. **js/admin-property-form.js** (línea ~6)
4. **js/firebase-loader.js** (que crearemos a continuación)

**Busca en cada archivo:**
```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  // ...
};
```

**Y reemplázalo con tu configuración real.**

## 📝 Archivos Creados

### Panel de Administración
- `admin-login.html` - Página de inicio de sesión
- `admin-panel.html` - Panel principal (dashboard)
- `admin-property-form.html` - Formulario para crear/editar propiedades
- `js/admin-property-form.js` - Lógica del formulario

### Archivos a Modificar
- `listings.html` - Se modificará para leer desde Firebase
- `property.html` - Se modificará para leer desde Firebase

## 🔐 Acceso al Panel

Una vez configurado, puedes acceder al panel de administración en:

```
http://localhost:8000/admin-login.html
```

O en tu dominio:
```
https://tu-dominio.com/admin-login.html
```

**Credenciales:**
- Email: El que creaste en el Paso 3
- Contraseña: La que creaste en el Paso 3

## 🎯 Cómo Usar el Panel

### Crear una Nueva Propiedad

1. Inicia sesión en el panel
2. Haz clic en **"+ Nueva Propiedad"**
3. Completa el formulario:
   - **Información básica**: título, tipo, operación, precio
   - **Ubicación**: dirección, barrio, coordenadas
   - **Características**: dormitorios, baños, superficie, etc.
   - **Descripción**: texto descriptivo
   - **Imágenes**: arrastra o selecciona imágenes
4. Haz clic en **"Guardar Propiedad"**

### Editar una Propiedad

1. En el panel, busca la propiedad en la tabla
2. Haz clic en **"Editar"**
3. Modifica los campos necesarios
4. Haz clic en **"Actualizar Propiedad"**

### Eliminar una Propiedad

1. En el panel, busca la propiedad en la tabla
2. Haz clic en **"Eliminar"**
3. Confirma la eliminación

## 🔄 Próximos Pasos

Ahora necesitas:

1. ✅ Actualizar las credenciales de Firebase en los archivos
2. ⏳ Modificar `listings.html` para leer propiedades desde Firebase
3. ⏳ Modificar la visualización individual de propiedades
4. ⏳ Probar el sistema completo

## 🆘 Solución de Problemas

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verifica que copiaste correctamente la `apiKey` de Firebase

### Error: "Missing or insufficient permissions"
- Revisa las reglas de Firestore y Storage
- Asegúrate de estar autenticado

### Las imágenes no se suben
- Verifica que Firebase Storage esté habilitado
- Revisa las reglas de Storage
- Verifica que las imágenes sean menores a 5MB

### No puedo iniciar sesión
- Verifica que creaste el usuario en Authentication
- Verifica el correo y contraseña
- Revisa la consola del navegador para ver errores

## 📞 Soporte

Si tienes problemas con la configuración, revisa:
1. La consola del navegador (F12) para ver errores
2. La consola de Firebase para ver logs
3. Que todos los servicios de Firebase estén habilitados

---

**Siguiente archivo a crear:** `js/firebase-loader.js` para cargar propiedades en el sitio público
