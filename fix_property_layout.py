#!/usr/bin/env python3
"""
Script para corregir la estructura HTML de las páginas de propiedades
moviendo la sección de ubicación dentro de property-main correctamente
"""

import os
import re
from pathlib import Path


def fix_property_structure(content):
    """Corrige la estructura para que el mapa esté en la columna principal"""
    
    # Patrón para encontrar la sección de ubicación mal colocada
    # La sección de ubicación cierra </div> antes del sidebar
    pattern = r'(</div>\s*<div class="property-location">.*?</div>\s*</div>)\s*(</div>\s*<aside class="property-sidebar">)'
    
    # Verificar si tiene la estructura incorrecta
    if not re.search(pattern, content, re.DOTALL):
        return content
    
    # Corregir: mover el cierre del div después de la ubicación
    def replacer(match):
        location_section = match.group(1)
        sidebar_start = match.group(2)
        
        # Remover el cierre extra del div de location
        location_section_fixed = re.sub(r'</div>\s*</div>\s*$', '</div>', location_section)
        
        # Agregar el cierre correcto antes del sidebar
        return location_section_fixed + '\n      </div>\n\n      <aside class="property-sidebar">'
    
    updated = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    return updated


def process_property_file(file_path):
    """Procesa un archivo HTML de propiedad"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Corregir estructura
        content = fix_property_structure(content)
        
        # Solo guardar si hubo cambios
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
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
        if process_property_file(html_file):
            print(f"✓ Corregido: {html_file}")
            success_count += 1
        else:
            print(f"- Sin cambios: {html_file}")
    
    print(f"\n✅ Archivos modificados: {success_count}/{len(html_files)}")


if __name__ == '__main__':
    main()
