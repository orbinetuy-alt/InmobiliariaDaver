#!/usr/bin/env python3
"""
Script para agregar el widget de Chatwoot a todas las páginas de propiedades
"""

import os
import re

# Widget de Chatwoot a insertar
CHATWOOT_WIDGET = '''  
  <!-- Chatwoot Widget -->
  <script>
    (function(d,t) {
      var BASE_URL="https://app.chatwoot.com";
      var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
      g.src=BASE_URL+"/packs/js/sdk.js";
      g.async = true;
      s.parentNode.insertBefore(g,s);
      g.onload=function(){
        window.chatwootSDK.run({
          websiteToken: 'BhmaP6ARxYmVh7b2cQfuHjZC',
          baseUrl: BASE_URL
        })
      }
    })(document,"script");
  </script>
</body>'''

def add_chatwoot_to_file(filepath):
    """Agrega el widget de Chatwoot a un archivo HTML si no lo tiene ya"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar si ya tiene Chatwoot
    if 'chatwoot' in content.lower():
        print(f"✓ {filepath} ya tiene Chatwoot")
        return False
    
    # Buscar </body> y reemplazarlo con el widget + </body>
    if '</body>' in content:
        content = content.replace('</body>', CHATWOOT_WIDGET)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Chatwoot agregado a {filepath}")
        return True
    else:
        print(f"✗ No se encontró </body> en {filepath}")
        return False

def main():
    """Función principal"""
    base_dir = "propiedad"
    updated_count = 0
    
    # Recorrer todas las carpetas de propiedades
    for zona in os.listdir(base_dir):
        zona_path = os.path.join(base_dir, zona)
        if not os.path.isdir(zona_path):
            continue
        
        for propiedad in os.listdir(zona_path):
            propiedad_path = os.path.join(zona_path, propiedad)
            if not os.path.isdir(propiedad_path):
                continue
            
            index_file = os.path.join(propiedad_path, "index.html")
            if os.path.exists(index_file):
                if add_chatwoot_to_file(index_file):
                    updated_count += 1
    
    print(f"\n✓ Proceso completado: {updated_count} archivos actualizados")

if __name__ == "__main__":
    main()
