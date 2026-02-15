#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de migración de propiedades estáticas a Firebase
Migra las 28 propiedades de la carpeta propiedad/ a Firestore + Storage
"""

import os
import re
import glob
import json
from pathlib import Path
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore, storage

# Inicializar Firebase Admin
def init_firebase():
    """Inicializa Firebase Admin SDK"""
    # Buscar el archivo de credenciales
    cred_path = None
    possible_paths = [
        'daver-inmobiliaria-65e82-firebase-adminsdk.json',
        'firebase-credentials.json',
        'serviceAccountKey.json'
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            cred_path = path
            break
    
    if not cred_path:
        print("❌ ERROR: No se encontró el archivo de credenciales de Firebase")
        print("Descárgalo desde: Firebase Console > Project Settings > Service Accounts")
        return None, None
    
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'daver-inmobiliaria-65e82.firebasestorage.app'
        })
        db = firestore.client()
        bucket = storage.bucket()
        print(f"✅ Firebase inicializado correctamente")
        return db, bucket
    except Exception as e:
        print(f"❌ Error al inicializar Firebase: {e}")
        return None, None

# Extraer datos del HTML
def parse_property_html(html_path):
    """Parsea un archivo HTML y extrae todos los datos de la propiedad"""
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    data = {}
    
    # Extraer tipo de propiedad
    property_type = soup.find('span', class_='property-type')
    data['type'] = property_type.text.strip() if property_type else ''
    
    # Extraer título
    title = soup.find('h2')
    data['title'] = title.text.strip() if title else ''
    
    # Extraer barrio del título (ej: "Apartamento en Tres Cruces, Montevideo")
    if 'en' in data['title']:
        neighborhood = data['title'].split('en')[1].split(',')[0].strip()
        data['neighborhood'] = neighborhood
    else:
        data['neighborhood'] = ''
    
    # Extraer operación (Venta/Alquiler)
    price_label = soup.find('span', class_='price-label')
    data['operation'] = price_label.text.strip() if price_label else ''
    
    # Extraer precio
    price_span = soup.find('span', class_='price')
    if price_span:
        price_text = price_span.text.strip().replace('$', '').replace('.', '').replace(',', '')
        data['price'] = price_text
    else:
        data['price'] = ''
    
    # Extraer gastos comunes
    price_detail = soup.find('span', class_='price-detail')
    if price_detail:
        gc_text = price_detail.text.strip()
        # Extraer solo el número (ej: "+ $8.000 GC" -> "8000")
        gc_match = re.search(r'\$?([\d.,]+)', gc_text)
        data['commonExpenses'] = gc_match.group(1).replace('.', '').replace(',', '') if gc_match else ''
    else:
        data['commonExpenses'] = ''
    
    # Extraer características
    features = soup.find_all('div', class_='feature-item')
    for feature in features:
        strong = feature.find('strong')
        span = feature.find('span')
        if strong and span:
            key = strong.text.strip().lower()
            value = span.text.strip()
            
            if 'dormitorio' in key:
                data['bedrooms'] = value
            elif 'baño' in key:
                data['bathrooms'] = value
            elif 'superficie' in key:
                # Extraer solo el número (ej: "55 m²" -> "55")
                area_match = re.search(r'(\d+)', value)
                data['area'] = area_match.group(1) if area_match else value
            elif 'garage' in key:
                data['garage'] = value
            elif 'piso' in key:
                data['floor'] = value
    
    # Extraer descripción completa
    description_div = soup.find('div', class_='property-description')
    if description_div:
        # Remover el h3 "Descripción"
        h3 = description_div.find('h3')
        if h3:
            h3.decompose()
        
        # Obtener todo el texto
        data['description'] = description_div.get_text(separator='\n').strip()
    else:
        data['description'] = ''
    
    # Extraer imágenes del script
    script_tags = soup.find_all('script')
    images = []
    for script in script_tags:
        if 'window.propertyGalleryImages' in script.text:
            # Extraer el array de imágenes
            match = re.search(r'window\.propertyGalleryImages\s*=\s*\[(.*?)\]', script.text, re.DOTALL)
            if match:
                images_text = match.group(1)
                # Extraer cada ruta de imagen
                image_paths = re.findall(r'"([^"]+)"', images_text)
                images = image_paths
                break
    
    data['images_paths'] = images
    
    return data

# Encontrar carpeta de imágenes
def find_images_folder(html_path, images_paths):
    """Encuentra la carpeta real de imágenes en assets/properties/"""
    if not images_paths:
        return None
    
    # Tomar la primera imagen y extraer la carpeta
    # Ej: "../../../assets/properties/tres-cruces-apartamento-2dorm/foto-1.jpeg"
    first_image = images_paths[0]
    match = re.search(r'assets/properties/([^/]+)/', first_image)
    if match:
        folder_name = match.group(1)
        assets_path = Path(html_path).parent.parent.parent / 'assets' / 'properties' / folder_name
        if assets_path.exists():
            return str(assets_path)
    
    return None

# Subir imágenes a Firebase Storage
def upload_images(bucket, images_folder, property_id):
    """Sube todas las imágenes de una propiedad a Firebase Storage"""
    if not images_folder or not os.path.exists(images_folder):
        return []
    
    image_urls = []
    image_files = sorted(glob.glob(os.path.join(images_folder, '*')))
    
    for idx, image_path in enumerate(image_files, 1):
        if not os.path.isfile(image_path):
            continue
        
        # Extensión del archivo
        ext = os.path.splitext(image_path)[1]
        
        # Nombre en Storage: properties/{property_id}/image_{idx}.{ext}
        blob_name = f'properties/{property_id}/image_{idx}{ext}'
        blob = bucket.blob(blob_name)
        
        try:
            # Subir imagen
            blob.upload_from_filename(image_path)
            
            # Hacer pública
            blob.make_public()
            
            # Obtener URL pública
            image_urls.append(blob.public_url)
            print(f"  ✅ Imagen {idx}/{len(image_files)} subida")
        except Exception as e:
            print(f"  ❌ Error al subir imagen {idx}: {e}")
    
    return image_urls

# Crear documento en Firestore
def create_firestore_document(db, property_data, image_urls):
    """Crea un documento en Firestore con los datos de la propiedad"""
    try:
        doc_ref = db.collection('properties').document()
        
        firestore_data = {
            'title': property_data.get('title', ''),
            'type': property_data.get('type', ''),
            'neighborhood': property_data.get('neighborhood', ''),
            'operation': property_data.get('operation', ''),
            'price': property_data.get('price', ''),
            'commonExpenses': property_data.get('commonExpenses', ''),
            'bedrooms': property_data.get('bedrooms', ''),
            'bathrooms': property_data.get('bathrooms', ''),
            'area': property_data.get('area', ''),
            'description': property_data.get('description', ''),
            'images': image_urls,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'featured': False
        }
        
        # Agregar campos opcionales si existen
        if property_data.get('garage'):
            firestore_data['garage'] = property_data['garage']
        if property_data.get('floor'):
            firestore_data['floor'] = property_data['floor']
        
        doc_ref.set(firestore_data)
        
        return doc_ref.id
    except Exception as e:
        print(f"  ❌ Error al crear documento: {e}")
        return None

# Migrar todas las propiedades
def migrate_all_properties():
    """Función principal que migra todas las propiedades"""
    print("=" * 60)
    print("🚀 INICIANDO MIGRACIÓN DE PROPIEDADES A FIREBASE")
    print("=" * 60)
    print()
    
    # Inicializar Firebase
    db, bucket = init_firebase()
    if not db or not bucket:
        return
    
    # Encontrar todos los archivos index.html en propiedad/
    property_files = glob.glob('propiedad/**/index.html', recursive=True)
    print(f"📁 Encontradas {len(property_files)} propiedades para migrar\n")
    
    if not property_files:
        print("❌ No se encontraron propiedades en la carpeta propiedad/")
        return
    
    # Estadísticas
    success_count = 0
    error_count = 0
    migrated_properties = []
    
    # Migrar cada propiedad
    for idx, html_path in enumerate(property_files, 1):
        print(f"\n{'=' * 60}")
        print(f"[{idx}/{len(property_files)}] Procesando: {html_path}")
        print('=' * 60)
        
        try:
            # 1. Parsear HTML
            print("📄 Extrayendo datos del HTML...")
            property_data = parse_property_html(html_path)
            print(f"  Título: {property_data['title']}")
            print(f"  Tipo: {property_data['type']}")
            print(f"  Operación: {property_data['operation']}")
            print(f"  Precio: ${property_data['price']}")
            
            # 2. Encontrar carpeta de imágenes
            images_folder = find_images_folder(html_path, property_data['images_paths'])
            if images_folder:
                image_count = len(glob.glob(os.path.join(images_folder, '*')))
                print(f"📸 Carpeta de imágenes: {images_folder} ({image_count} imágenes)")
            else:
                print("⚠️  No se encontró carpeta de imágenes")
            
            # 3. Generar ID temporal para Storage
            temp_id = f"temp_{idx}_{Path(html_path).parent.name}"
            
            # 4. Subir imágenes
            print("☁️  Subiendo imágenes a Firebase Storage...")
            image_urls = upload_images(bucket, images_folder, temp_id)
            print(f"  Total subidas: {len(image_urls)} imágenes")
            
            # 5. Crear documento en Firestore
            print("💾 Creando documento en Firestore...")
            doc_id = create_firestore_document(db, property_data, image_urls)
            
            if doc_id:
                print(f"✅ MIGRACIÓN EXITOSA - ID: {doc_id}")
                success_count += 1
                migrated_properties.append({
                    'html_path': html_path,
                    'doc_id': doc_id,
                    'title': property_data['title']
                })
            else:
                print(f"❌ ERROR al crear documento")
                error_count += 1
        
        except Exception as e:
            print(f"❌ ERROR en la migración: {e}")
            error_count += 1
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE MIGRACIÓN")
    print("=" * 60)
    print(f"✅ Exitosas: {success_count}")
    print(f"❌ Con errores: {error_count}")
    print(f"📝 Total procesadas: {len(property_files)}")
    print()
    
    if migrated_properties:
        print("Propiedades migradas:")
        for prop in migrated_properties:
            print(f"  • {prop['title']} (ID: {prop['doc_id']})")
    
    print("\n✨ Migración completada!")
    print("Verifica las propiedades en: http://localhost:8000/admin-panel.html")

if __name__ == '__main__':
    migrate_all_properties()
