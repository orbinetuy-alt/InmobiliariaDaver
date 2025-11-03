# 📊 Guía de Configuración: Analytics de Búsquedas con Google Sheets

Esta guía te ayudará a configurar el registro automático de todas las búsquedas realizadas con el buscador AI en una Google Sheet para análisis de datos.

---

## 🎯 ¿Qué vas a lograr?

Cada vez que alguien haga una búsqueda en tu web, se guardará automáticamente:
- 📝 Texto de la búsqueda
- 🎯 Cantidad de resultados encontrados
- 🏷️ Filtros aplicados (tipo, zona, precio, etc.)
- 📅 Fecha y hora
- 📱 Tipo de dispositivo (Mobile/Desktop)

---

## 🚀 Pasos para Configurar (5 minutos)

### 1️⃣ Crear tu Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja llamada **"Daver Analytics - Búsquedas"**
3. En la **primera fila** (fila 1), crea estas columnas exactamente como aparecen:

```
fecha | hora | busqueda | resultados | tipo | zona | operacion | precio_min | precio_max | dormitorios | dispositivo | timestamp
```

**Importante:** Los nombres deben estar en minúsculas y con guiones bajos (_) en lugar de espacios.

### 2️⃣ Conectar con SheetDB

1. Ve a **[SheetDB.io](https://sheetdb.io/)**
2. Haz clic en **"Sign Up Free"** (es gratis hasta 500 requests/mes)
3. Inicia sesión con tu cuenta de Google
4. Haz clic en **"Create API"**
5. Selecciona tu Google Sheet **"Daver Analytics - Búsquedas"**
6. SheetDB te mostrará un **API Endpoint** como este:
   ```
   https://sheetdb.io/api/v1/abc123xyz456
   ```
7. **Copia ese URL completo**

### 3️⃣ Configurar en tu Código

1. Abre el archivo: `js/ai-search.js`
2. Busca la línea 20 (aproximadamente) que dice:
   ```javascript
   const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/TU_SHEETDB_API_ID';
   ```
3. Reemplaza `'https://sheetdb.io/api/v1/TU_SHEETDB_API_ID'` con tu URL de SheetDB
4. Por ejemplo:
   ```javascript
   const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/abc123xyz456';
   ```
5. Guarda el archivo

### 4️⃣ ¡Listo! Prueba tu Analytics

1. Abre tu sitio web
2. Haz una búsqueda con el buscador AI (por ejemplo: "casa en Pocitos")
3. Ve a tu Google Sheet
4. ¡Deberías ver una nueva fila con los datos de la búsqueda! 🎉

---

## 📊 Ejemplo de Datos que se Guardarán

| fecha | hora | busqueda | resultados | tipo | zona | operacion | precio_min | precio_max | dormitorios | dispositivo | timestamp |
|-------|------|----------|------------|------|------|-----------|------------|------------|-------------|-------------|-----------|
| 03/11/2025 | 14:30:25 | casa en Pocitos | 2 | casa | pocitos | venta | N/A | N/A | N/A | Desktop | 2025-11-03T14:30:25.123Z |
| 03/11/2025 | 15:15:42 | apartamento 2 dormitorios menos de 150 mil | 3 | apartamento | N/A | venta | 0 | 150000 | 2 | Mobile | 2025-11-03T15:15:42.456Z |

---

## 📈 Cómo Analizar tus Datos

Una vez que tengas datos en tu Google Sheet, podés:

### 1. **Ver búsquedas más populares**
   - Ordena por la columna "busqueda"
   - Identifica patrones comunes

### 2. **Analizar qué buscan más**
   - Filtra por "tipo" (casa, apartamento, oficina)
   - Filtra por "zona" para ver qué barrios son más buscados
   - Filtra por "operacion" (venta/alquiler)

### 3. **Crear gráficos automáticos**
   - Selecciona datos → Insertar → Gráfico
   - Ejemplos útiles:
     - Gráfico de barras: Búsquedas por zona
     - Gráfico circular: Tipo de propiedad más buscado
     - Línea temporal: Búsquedas por día/hora

### 4. **Exportar a Excel**
   - Archivo → Descargar → Microsoft Excel (.xlsx)

### 5. **Identificar tendencias de precio**
   - Analiza las columnas precio_min y precio_max
   - ¿Qué rangos de precio busca la mayoría?

---

## 🔒 Privacidad y Seguridad

- **NO** se guarda información personal identificable
- **NO** se guarda IP ni ubicación exacta
- Solo se registran búsquedas y preferencias generales
- Los datos son privados en tu Google Sheet

---

## 💡 Tips Pro

1. **Revisa tus analytics semanalmente** para entender qué buscan tus clientes
2. **Agrega propiedades** en las zonas y precios más buscados
3. **Crea campañas** de marketing basadas en las búsquedas populares
4. **Mejora tu inventario** según la demanda real

---

## ⚠️ Solución de Problemas

### Las búsquedas no se registran
- Verifica que copiaste bien el URL de SheetDB
- Asegúrate de que las columnas en tu Google Sheet están exactamente como se indica
- Abre la consola del navegador (F12) y busca errores en rojo

### Error "403 Forbidden"
- Verifica que tu Google Sheet sea accesible
- En SheetDB, asegúrate de tener permisos de escritura activados

### Error "Network Error"
- Verifica tu conexión a internet
- Puede haber un límite de requests (500/mes en plan gratuito)

---

## 📞 ¿Necesitas Ayuda?

Si tenés problemas con la configuración, revisá:
1. La consola del navegador (F12 → Console)
2. Los logs de SheetDB en tu dashboard
3. Los permisos de tu Google Sheet

---

## 🎓 Plan Gratuito de SheetDB

- ✅ 500 requests por mes
- ✅ Ilimitados sheets
- ✅ Acceso a API REST
- ✅ Suficiente para empezar

Si necesitás más (muchas búsquedas diarias), podés upgradear a un plan pago después.

---

**¡Listo! Ya tenés analytics profesionales de búsquedas totalmente gratis** 🚀📊
