#!/usr/bin/env python3
"""
Script para agregar mapas de ubicación a todas las páginas de propiedades
y actualizar el menú de navegación con el enlace de "Ubicación"
"""

import os
import re
from pathlib import Path

# Mapeo de barrios a coordenadas aproximadas en Montevideo
BARRIO_COORDS = {
    'pocitos': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13086.5!2d-56.1571!3d-34.9062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81ba8e7e8e8d%3A0x7f7f7f7f7f7f7f7f!2sPocitos%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Pocitos'),
    'punta-carretas': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13087.2!2d-56.1638!3d-34.9189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81bb5e5e5e5d%3A0x7f7f7f7f7f7f7f7f!2sPunta%20Carretas%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Punta Carretas'),
    'carrasco': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26172.8!2d-56.0551!3d-34.8787!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f7f7f7f7f7f7f%3A0x7f7f7f7f7f7f7f7f!2sCarrasco%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Carrasco'),
    'tres-cruces': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13085.3!2d-56.1673!3d-34.8939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f80f5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sTres%20Cruces%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Tres Cruces'),
    'centro': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13084.5!2d-56.1914!3d-34.9058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81d5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sCentro%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Centro'),
    'ciudad-vieja': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13084.8!2d-56.2073!3d-34.9073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81e5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sCiudad%20Vieja%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Ciudad Vieja'),
    'cordon': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13084.2!2d-56.1813!3d-34.9031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81c5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sCord%C3%B3n%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Cordón'),
    'palermo': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13085.8!2d-56.1725!3d-34.9098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f80e5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sPalermo%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Palermo'),
    'union': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13083.5!2d-56.1945!3d-34.8843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81a5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sUni%C3%B3n%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Unión'),
    'la-comercial': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13082.8!2d-56.2103!3d-34.8692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f80a5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sLa%20Comercial%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'La Comercial'),
    'la-figurita': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13082.3!2d-56.1923!3d-34.8523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f80b5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sLa%20Figurita%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'La Figurita'),
    'capurro': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13084.9!2d-56.2154!3d-34.8893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81f5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sCapurro%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Capurro'),
    'aguada': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13085.1!2d-56.1994!3d-34.8923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81g5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sAguada%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Aguada'),
    'barrio-sur': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13085.6!2d-56.1894!3d-34.9123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81h5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sBarrio%20Sur%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Barrio Sur'),
    'la-blanqueada': ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13083.9!2d-56.1653!3d-34.8893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f80c5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sLa%20Blanqueada%2C%20Montevideo!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'La Blanqueada'),
}

# Coordenadas por defecto para barrios no listados o IDs numéricos
DEFAULT_COORDS = ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d104685.4!2d-56.1914!3d-34.9011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81c5e5e5e5e5%3A0x7f7f7f7f7f7f7f7f!2sMontevideo%2C%20Uruguay!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy', 'Montevideo')


def get_barrio_from_path(file_path):
    """Extrae el barrio del path del archivo"""
    parts = Path(file_path).parts
    # Buscar el barrio en el path (será el directorio después de 'propiedad')
    try:
        propiedad_idx = parts.index('propiedad')
        if propiedad_idx + 1 < len(parts):
            return parts[propiedad_idx + 1]
    except ValueError:
        pass
    return None


def update_navigation_menu(content):
    """Actualiza el menú de navegación para incluir Ubicación"""
    # Patrón para encontrar el menú sin Ubicación
    pattern = r'(<nav class="main-nav" id="mainNav">.*?<a href="\.\.\/\.\.\/\.\.\/listings\.html">.*?Propiedades\s*<\/a>)(.*?)(<a href="\.\.\/\.\.\/\.\.\/contacto\.html">)'
    
    ubicacion_link = '''
        <a href="../../../ubicacion.html">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Ubicación
        </a>'''
    
    # Verificar si ya tiene el enlace de Ubicación
    if 'ubicacion.html' in content:
        return content
    
    replacement = r'\g<1>' + ubicacion_link + r'\g<3>'
    updated = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    return updated


def add_location_section(content, barrio, barrio_display):
    """Agrega la sección de ubicación con mapa antes del cierre de property-main"""
    
    # Buscar el final de property-description
    pattern = r'(<div class="property-description">.*?</div>)\s*(</div>\s*<aside class="property-sidebar">)'
    
    map_url, default_name = BARRIO_COORDS.get(barrio, DEFAULT_COORDS)
    display_name = barrio_display if barrio_display else default_name
    
    location_section = f'''

        <div class="property-location">
          <h3>Ubicación</h3>
          <div class="location-map">
            <iframe 
              src="{map_url}"
              width="100%" 
              height="400" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade"
              title="Ubicación de la propiedad en {display_name}">
            </iframe>
          </div>
          <p class="location-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            La ubicación en el mapa es aproximada de la zona de {display_name}.
          </p>
        </div>
      </div>'''
    
    # Verificar si ya tiene la sección de ubicación
    if 'property-location' in content:
        return content
    
    replacement = r'\g<1>' + location_section + r'\g<2>'
    updated = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    return updated


def process_property_file(file_path):
    """Procesa un archivo HTML de propiedad"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extraer barrio del path
        barrio = get_barrio_from_path(file_path)
        
        # Extraer nombre del barrio del contenido si está disponible
        barrio_match = re.search(r'<address>.*?<svg.*?</svg>\s*([^<]+?),\s*Montevideo', content, re.DOTALL)
        barrio_display = barrio_match.group(1).strip() if barrio_match else None
        
        # Actualizar navegación
        content = update_navigation_menu(content)
        
        # Agregar sección de ubicación
        content = add_location_section(content, barrio, barrio_display)
        
        # Guardar cambios
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error procesando {file_path}: {e}")
        return False


def main():
    """Función principal"""
    base_dir = Path(__file__).parent / 'propiedad'
    
    if not base_dir.exists():
        print(f"Error: No se encontró el directorio {base_dir}")
        return
    
    # Buscar todos los archivos index.html en subdirectorios
    html_files = list(base_dir.rglob('index.html'))
    
    print(f"Encontrados {len(html_files)} archivos HTML de propiedades")
    
    success_count = 0
    for html_file in html_files:
        print(f"Procesando: {html_file}")
        if process_property_file(html_file):
            success_count += 1
    
    print(f"\n✅ Procesados exitosamente: {success_count}/{len(html_files)} archivos")


if __name__ == '__main__':
    main()
