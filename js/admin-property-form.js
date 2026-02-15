import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCj6nyM8iqeXLEPNp46M_j-CW7aCTYM60A",
  authDomain: "daver-inmobiliaria-65e82.firebaseapp.com",
  projectId: "daver-inmobiliaria-65e82",
  storageBucket: "daver-inmobiliaria-65e82.firebasestorage.app",
  messagingSenderId: "936144386163",
  appId: "1:936144386163:web:10b999ab6dcc9456bcd206"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let uploadedImages = [];
let propertyId = null;
let existingProperty = null;

// Verificar autenticación
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'admin-login.html';
  } else {
    // Verificar si estamos editando
    const urlParams = new URLSearchParams(window.location.search);
    propertyId = urlParams.get('id');
    
    if (propertyId) {
      document.getElementById('formTitle').textContent = 'Editar Propiedad';
      document.getElementById('submitBtn').textContent = 'Actualizar Propiedad';
      loadPropertyData(propertyId);
    }
  }
});

// Cargar datos de propiedad existente
async function loadPropertyData(id) {
  try {
    const docRef = doc(db, 'properties', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      existingProperty = docSnap.data();
      fillFormWithData(existingProperty);
    } else {
      alert('Propiedad no encontrada');
      window.location.href = 'admin-panel.html';
    }
  } catch (error) {
    console.error('Error al cargar propiedad:', error);
    alert('Error al cargar la propiedad');
  }
}

// Llenar formulario con datos existentes
function fillFormWithData(data) {
  document.getElementById('title').value = data.title || '';
  document.getElementById('type').value = data.type || '';
  document.getElementById('operation').value = data.operation || '';
  document.getElementById('price').value = data.price || '';
  document.getElementById('currency').value = data.currency || 'USD';
  document.getElementById('address').value = data.address || '';
  document.getElementById('neighborhood').value = data.neighborhood || '';
  document.getElementById('city').value = data.city || 'Montevideo';
  document.getElementById('latitude').value = data.latitude || '';
  document.getElementById('longitude').value = data.longitude || '';
  document.getElementById('bedrooms').value = data.bedrooms || '';
  document.getElementById('bathrooms').value = data.bathrooms || '';
  document.getElementById('area').value = data.area || '';
  document.getElementById('garages').value = data.garages || '';
  document.getElementById('commonExpenses').value = data.commonExpenses || '';
  document.getElementById('description').value = data.description || '';
  
  // Características
  if (data.features && Array.isArray(data.features)) {
    data.features.forEach(feature => {
      const checkbox = document.querySelector(`input[value="${feature}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }
  
  // Imágenes existentes
  if (data.images && Array.isArray(data.images)) {
    uploadedImages = data.images;
    renderImagePreviews();
  }
}

// Manejo de carga de imágenes
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

uploadArea.addEventListener('click', () => imageInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

imageInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  const validFiles = Array.from(files).filter(file => {
    const isValid = file.type.startsWith('image/');
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
    
    if (!isValid) {
      alert(`${file.name} no es una imagen válida`);
      return false;
    }
    
    if (!isValidSize) {
      alert(`${file.name} es demasiado grande. Máximo 5MB por imagen.`);
      return false;
    }
    
    return true;
  });
  
  validFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImages.push({
        file: file,
        preview: e.target.result,
        uploaded: false
      });
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
}

function renderImagePreviews() {
  imagePreview.innerHTML = uploadedImages.map((img, index) => `
    <div class="image-preview-item">
      <img src="${img.preview || img}" alt="Preview ${index + 1}">
      ${index === 0 ? '<span class="main-badge">Principal</span>' : ''}
      <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
    </div>
  `).join('');
}

window.removeImage = async function(index) {
  const imageToRemove = uploadedImages[index];
  
  // Si es una URL existente en Storage, marcarla para eliminar
  if (typeof imageToRemove === 'string' && imageToRemove.includes('firebase')) {
    const confirmDelete = confirm('¿Eliminar esta imagen permanentemente?');
    if (!confirmDelete) return;
    
    try {
      const imageRef = ref(storage, imageToRemove);
      await deleteObject(imageRef);
      console.log('Imagen eliminada de Storage');
    } catch (error) {
      console.warn('Error al eliminar imagen de Storage:', error);
      // Continuar aunque falle (podría no existir)
    }
  }
  
  uploadedImages.splice(index, 1);
  renderImagePreviews();
};

// Subir imagen a Firebase Storage
async function uploadImage(imageData, propertyId, index) {
  if (typeof imageData === 'string') {
    // Ya es una URL, no necesita subirse
    return imageData;
  }
  
  const file = imageData.file;
  const timestamp = Date.now();
  const fileName = `properties/${propertyId}/${timestamp}_${index}_${file.name}`;
  const storageRef = ref(storage, fileName);
  
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        updateUploadProgress(progress);
      },
      (error) => {
        console.error('Error al subir imagen:', error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

function updateUploadProgress(progress) {
  const progressBar = document.getElementById('progressBar');
  const uploadProgress = document.getElementById('uploadProgress');
  
  uploadProgress.classList.add('show');
  progressBar.style.width = `${progress}%`;
  
  if (progress >= 100) {
    setTimeout(() => {
      uploadProgress.classList.remove('show');
      progressBar.style.width = '0%';
    }, 500);
  }
}

// Validación del formulario
function validateForm() {
  const errors = [];
  
  // Validar título
  const title = document.getElementById('title').value.trim();
  if (title.length < 10) {
    errors.push('El título debe tener al menos 10 caracteres');
  }
  
  // Validar precio
  const price = parseFloat(document.getElementById('price').value);
  if (isNaN(price) || price <= 0) {
    errors.push('El precio debe ser un número mayor a 0');
  }
  
  // Validar descripción
  const description = document.getElementById('description').value.trim();
  if (description.length < 50) {
    errors.push('La descripción debe tener al menos 50 caracteres');
  }
  
  // Validar campos requeridos
  const requiredFields = [
    { id: 'type', name: 'Tipo de propiedad' },
    { id: 'operation', name: 'Tipo de operación' },
    { id: 'address', name: 'Dirección' },
    { id: 'neighborhood', name: 'Barrio' }
  ];
  
  requiredFields.forEach(field => {
    const value = document.getElementById(field.id).value.trim();
    if (!value) {
      errors.push(`${field.name} es obligatorio`);
    }
  });
  
  // Validar coordenadas si se proporcionan
  const lat = document.getElementById('latitude').value.trim();
  const lng = document.getElementById('longitude').value.trim();
  if (lat && lng) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      errors.push('La latitud debe estar entre -90 y 90');
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      errors.push('La longitud debe estar entre -180 y 180');
    }
  }
  
  return errors;
}

// Enviar formulario
document.getElementById('propertyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Validar formulario
  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    alert('⚠️ Por favor corrige los siguientes errores:\n\n• ' + validationErrors.join('\n• '));
    return;
  }
  
  // Validar que hay al menos una imagen
  if (uploadedImages.length === 0) {
    alert('⚠️ Por favor agrega al menos una imagen de la propiedad');
    return;
  }
  
  const submitBtn = document.getElementById('submitBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  
  submitBtn.disabled = true;
  loadingOverlay.classList.add('show');
  
  try {
    // Recopilar características seleccionadas
    const features = [];
    document.querySelectorAll('.feature-checkbox input:checked').forEach(checkbox => {
      features.push(checkbox.value);
    });
    
    // Preparar datos de la propiedad
    const propertyData = {
      title: document.getElementById('title').value.trim(),
      type: document.getElementById('type').value,
      operation: document.getElementById('operation').value,
      price: parseFloat(document.getElementById('price').value),
      currency: document.getElementById('currency').value,
      address: document.getElementById('address').value.trim(),
      neighborhood: document.getElementById('neighborhood').value.trim(),
      city: document.getElementById('city').value.trim(),
      latitude: document.getElementById('latitude').value.trim() || null,
      longitude: document.getElementById('longitude').value.trim() || null,
      bedrooms: parseInt(document.getElementById('bedrooms').value) || 0,
      bathrooms: parseInt(document.getElementById('bathrooms').value) || 0,
      area: parseFloat(document.getElementById('area').value) || 0,
      garages: parseInt(document.getElementById('garages').value) || 0,
      commonExpenses: parseInt(document.getElementById('commonExpenses').value) || null,
      description: document.getElementById('description').value.trim(),
      features: features,
      updatedAt: serverTimestamp()
    };
    
    // Modo edición vs creación
    if (propertyId) {
      // EDITAR PROPIEDAD EXISTENTE
      loadingText.textContent = 'Procesando imágenes...';
      
      // Separar imágenes existentes (URLs) de nuevas (archivos)
      const existingImageUrls = uploadedImages.filter(img => typeof img === 'string');
      const newImageFiles = uploadedImages.filter(img => typeof img !== 'string');
      
      // Subir solo las imágenes nuevas
      const newImageUrls = [];
      for (let i = 0; i < newImageFiles.length; i++) {
        loadingText.textContent = `Subiendo imagen ${i + 1} de ${newImageFiles.length}...`;
        const imageUrl = await uploadImage(newImageFiles[i], propertyId, Date.now() + i);
        newImageUrls.push(imageUrl);
      }
      
      // Combinar URLs existentes con las nuevas
      propertyData.images = [...existingImageUrls, ...newImageUrls];
      
      // Actualizar documento
      loadingText.textContent = 'Actualizando propiedad...';
      await updateDoc(doc(db, 'properties', propertyId), propertyData);
      
      alert('✓ Propiedad actualizada exitosamente');
      
    } else {
      // CREAR NUEVA PROPIEDAD
      loadingText.textContent = 'Creando propiedad...';
      propertyData.createdAt = serverTimestamp();
      propertyData.images = []; // Inicialmente vacío
      
      const docRef = await addDoc(collection(db, 'properties'), propertyData);
      const newPropertyId = docRef.id;
      
      // Subir todas las imágenes
      loadingText.textContent = 'Subiendo imágenes...';
      const imageUrls = [];
      
      for (let i = 0; i < uploadedImages.length; i++) {
        loadingText.textContent = `Subiendo imagen ${i + 1} de ${uploadedImages.length}...`;
        const imageUrl = await uploadImage(uploadedImages[i], newPropertyId, i);
        imageUrls.push(imageUrl);
        updateUploadProgress((i + 1) / uploadedImages.length * 100);
      }
      
      // Actualizar con las URLs de imágenes
      loadingText.textContent = 'Finalizando...';
      await updateDoc(doc(db, 'properties', newPropertyId), { images: imageUrls });
      
      alert('✓ Propiedad creada exitosamente');
    }
    
    // Redirigir al panel
    setTimeout(() => {
      window.location.href = 'admin-panel.html';
    }, 500);
    
  } catch (error) {
    console.error('Error al guardar propiedad:', error);
    alert(`❌ Error al guardar la propiedad: ${error.message}`);
    submitBtn.disabled = false;
    loadingOverlay.classList.remove('show');
  }
});
