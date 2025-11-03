#!/usr/bin/env python3
"""
Script to update all property page contact forms to use Web3Forms
"""
import os
import re
from pathlib import Path

def get_property_title(html_content):
    """Extract property title from the HTML"""
    match = re.search(r'<title>([^|]+)', html_content)
    if match:
        return match.group(1).strip()
    return "Propiedad"

def update_property_form(file_path):
    """Update the contact form in a property page"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Get property title for the subject line
    property_title = get_property_title(content)
    
    # Pattern to match the old form structure
    old_form_pattern = r'(<form class="contact-form" id="(?:contactForm|propertyContactForm)">)(.*?)(</form>)'
    
    # New form structure
    new_form = f'''<form class="contact-form" id="propertyContactForm" action="https://api.web3forms.com/submit" method="POST">
            <!-- Web3Forms Access Key -->
            <input type="hidden" name="access_key" value="78465221-09a4-4110-835c-74106824b8c4">
            <input type="hidden" name="subject" value="Consulta por {property_title}">
            <input type="hidden" name="from_name" value="Formulario Propiedad - Daver">
            <input type="hidden" name="redirect" value="https://web3forms.com/success">
            
            <input type="text" id="name" name="name" placeholder="Nombre" required>
            <input type="email" id="email" name="email" placeholder="Email" required>
            <input type="tel" id="phone" name="phone" placeholder="Teléfono">
            <textarea id="message" name="message" rows="4" placeholder="Mensaje" required></textarea>
            <button type="submit" class="btn">Enviar consulta</button>
            <div id="formMsg"></div>
          </form>'''
    
    # Replace the form
    new_content = re.sub(
        old_form_pattern,
        new_form,
        content,
        flags=re.DOTALL
    )
    
    # Check if replacement was made
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    """Main function to update all property pages"""
    base_dir = Path(__file__).parent / "propiedad"
    
    if not base_dir.exists():
        print(f"Error: Directory {base_dir} not found")
        return
    
    updated_count = 0
    skipped_count = 0
    
    # Find all index.html files in property subdirectories
    for index_file in base_dir.rglob("*/*/index.html"):
        print(f"Processing: {index_file.relative_to(base_dir.parent)}")
        
        if update_property_form(index_file):
            updated_count += 1
            print(f"  ✓ Updated")
        else:
            skipped_count += 1
            print(f"  - No changes needed")
    
    print(f"\n{'='*50}")
    print(f"Summary:")
    print(f"  Updated: {updated_count} files")
    print(f"  Skipped: {skipped_count} files")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
