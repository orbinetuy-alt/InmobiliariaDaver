# Debug de Filtros - Firebase Daver Inmobiliaria

## Pasos para depurar el problema de filtros

### 1. Ver datos en Firebase
Abre: http://localhost:8000/debug-firebase.html

Esto te mostrará TODOS los datos guardados en Firebase. Verifica que cada propiedad tenga:
- ✅ `type`: "apartamento", "casa", "oficina", "terreno"
- ✅ `operation`: "venta", "alquiler"  
- ✅ `neighborhood`: "aguada", "pocitos", etc.
- ✅ `bedrooms`: 1, 2, 3, etc.

### 2. Ver atributos data-* en las tarjetas
Abre: http://localhost:8000/listings.html

Abre la Consola de Safari (Cmd + Option + I)

Verás logs como estos:
```
🏠 Creando card para: Apartamento en Pocitos
   data-type: apartamento
   data-operation: venta
   data-zone: pocitos
   data-bedrooms: 2
   data-price: 112000
```

### 3. Probar filtros
En listings.html, selecciona un filtro (por ejemplo, "Casas")

En la consola verás:
```
═══════════════════════════════════════
🔍 APLICANDO FILTROS
═══════════════════════════════════════
Filtro propertyType: casa
Total de tarjetas: 5

Tarjeta #1:
  data-type: "apartamento" | match: false
  data-operation: "venta" | match: true
  VISIBLE: false

Tarjeta #2:
  data-type: "casa" | match: true
  data-operation: "venta" | match: true
  VISIBLE: true
```

## Problemas comunes y soluciones

### Problema: Todos los data-* están VACÍOS
**Causa**: Los datos no se están guardando correctamente en Firebase
**Solución**: Verificar el formulario admin-property-form.html

### Problema: Los valores no coinciden
**Causa**: Los valores en Firebase tienen mayúsculas incorrectas o espacios
**Ejemplo**: Firebase tiene "Apartamento" pero el filtro busca "apartamento"
**Solución**: Normalizar los datos

### Problema: Las tarjetas no se filtran
**Causa**: Los atributos data-* no se están generando
**Solución**: Verificar firebase-loader.js línea 155

### Problema: Error de permisos en Firebase
**Causa**: Las reglas de Firestore no permiten lectura pública
**Solución**: Verificar las reglas en Firebase Console

## Reglas de Firestore correctas

Las reglas deben permitir lectura pública de properties:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties: lectura pública, escritura solo admin autenticado
    match /properties/{property} {
      allow read: if true;  // Lectura pública
      allow write: if request.auth != null;  // Escritura solo autenticados
    }
  }
}
```

Para verificar/cambiar las reglas:
1. Ve a https://console.firebase.google.com/
2. Selecciona proyecto: daver-inmobiliaria-65e82
3. Ve a Firestore Database → Rules
4. Verifica que allow read: if true esté presente

## Cómo reportar el problema

Una vez que ejecutes los pasos anteriores, dime:

1. ¿Cuántas propiedades se muestran en debug-firebase.html?
2. ¿Tienen todas los campos type, operation, neighborhood completos?
3. ¿Qué ves en la consola cuando se cargan las tarjetas?
4. ¿Qué ves en la consola cuando seleccionas un filtro?
5. ¿Hay algún error en rojo en la consola?

Con esta información podré identificar exactamente dónde está el problema.
