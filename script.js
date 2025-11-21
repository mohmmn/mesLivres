// ===========================
// script.js
// ===========================

// Configuration JSONBin
const BIN_ID = '691ef0d0d0ea881f40f44322';
const API_KEY = '$2a$10$5PBbHy5Fl7AJhakrgJXlRuDZuCfmMC4104TTl/M9zs4HqZCQkuSwy';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const HEADERS = { 
  'X-Master-Key': API_KEY,
  'X-Access-Key': '$2a$10$LLZGAvFtEFRy8jqnPiEagOLs/LnEyLJTsfMbIYYGOUEvPb1rcMjY.'
};

const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popupMessage');

// Afficher le popup
function showPopup(message, isError = false) {
  popupMessage.textContent = message;
  const content = popup.querySelector('.popup-content');
  
  if (isError) {
    content.classList.add('error');
  } else {
    content.classList.remove('error');
  }
  
  popup.classList.add('show');
  
  setTimeout(() => {
    popup.classList.remove('show');
  }, 3000);
}

// Échapper HTML pour éviter XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Récupérer les commentaires
async function fetchComments() {
  try {
    const res = await fetch(`${API_URL}/latest`, { 
      headers: HEADERS,
      method: 'GET'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    const comments = data.record?.comments || [];
    
    if (comments.length === 0) {
      commentsList.innerHTML = '<p style="opacity:0.7">Aucun commentaire pour le moment.</p>';
      return;
    }
    
    commentsList.innerHTML = comments.map(c => `
      <div class="comment-card">
        <strong>${escapeHtml(c.name)}</strong>
        <p>${escapeHtml(c.message)}</p>
      </div>
    `).join('');
  } catch(e) {
    console.error('Erreur fetchComments:', e);
    commentsList.innerHTML = '<p style="opacity:0.7">Erreur lors du chargement des commentaires.</p>';
  }
}

// Ajouter un commentaire
async function addComment(name, message) {
  try {
    // Récupérer les commentaires existants
    const res = await fetch(`${API_URL}/latest`, { 
      headers: HEADERS,
      method: 'GET'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    const comments = data.record?.comments || [];
    comments.push({ name, message, date: new Date().toISOString() });

    // Envoyer la mise à jour
    const updateRes = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/json',
        'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify({ comments })
    });
    
    if (!updateRes.ok) {
      throw new Error(`HTTP ${updateRes.status}: ${updateRes.statusText}`);
    }
    
    showPopup('✓ Commentaire ajouté avec succès !');
    fetchComments();
  } catch(e) {
    console.error('Erreur addComment:', e);
    showPopup('✗ Erreur lors de l\'ajout du commentaire', true);
  }
}

// Gestionnaire de soumission
commentForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();
  
  if (name && message) {
    addComment(name, message);
    commentForm.reset();
  }
});

// Charger les commentaires au démarrage
fetchComments();