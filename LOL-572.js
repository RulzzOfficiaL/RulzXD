// NOTIFICATION SYSTEM
function showNotification(message, type = 'info') {
  let container = document.querySelector('.notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icon = type === 'success' ? 'check-circle' :
              type === 'error' ? 'exclamation-circle' :
              type === 'warning' ? 'exclamation-triangle' : 'info-circle';
  
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${icon} notification-icon"></i>
      <span class="notification-message">${message}</span>
    </div>
  `;

  if (container.firstChild) {
    container.insertBefore(notification, container.firstChild);
  } else {
    container.appendChild(notification);
  }

  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('notification-exit');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 4000);
}

function clearAllNotifications() {
  const container = document.querySelector('.notification-container');
  if (container) {
    const notifications = container.querySelectorAll('.notification');
    notifications.forEach(notification => {
      notification.classList.add('notification-exit');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
    
    setTimeout(() => {
      if (container.parentNode && container.children.length === 0) {
        container.parentNode.removeChild(container);
      }
    }, 500);
  }
}

function initializeMobileMenu() {
  const hamb = document.getElementById('hamb');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');

  if (hamb && mobileMenu && closeMenu) {
    hamb.addEventListener('click', () => {
      hamb.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    closeMenu.addEventListener('click', () => {
      hamb.classList.remove('active');
      mobileMenu.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !hamb.contains(e.target) && mobileMenu.classList.contains('open')) {
        hamb.classList.remove('active');
        mobileMenu.classList.remove('open');
      }
    });
  }
}

function initializeAPIKeyCheck() {
  const checkApiKeyBtn = document.getElementById('checkApiKey');
  const clearInputBtn = document.getElementById('clearInput');
  const apiKeyInput = document.getElementById('apiKeyInput');

  if (checkApiKeyBtn && clearInputBtn && apiKeyInput) {
    checkApiKeyBtn.addEventListener('click', checkAPIKey);
    clearInputBtn.addEventListener('click', clearInput);

    apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkAPIKey();
    });
  }
}

function clearInput() {
  const apiKeyInput = document.getElementById('apiKeyInput');
  const apiKeyResult = document.getElementById('apiKeyResult');
  
  if (apiKeyInput) apiKeyInput.value = '';
  if (apiKeyResult) apiKeyResult.classList.add('hidden');
}

async function checkAPIKey() {
  const apiKeyInput = document.getElementById('apiKeyInput');
  if (!apiKeyInput) return;
  
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showNotification('Masukkan API Key terlebih dahulu!', 'warning');
    return;
  }
  
  try {
    showNotification('Memeriksa status API Key...', 'info');
    
    const response = await fetch('https://rulz-xdapi.vercel.app/api/check-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    
    const result = await response.json();
    console.log('DEBUG RESPONSE:', result); // Buat ngecek structure response
    
    // FIX: Pake result.success sesuai backend lu
    if (result.success === true) {
      showNotification('API Key valid dan aktif!', 'success');
      displayAPIKeyResult(apiKey, result.data);
    } else {
      showNotification(result.message || 'API Key tidak valid atau tidak ditemukan', 'error');
      displayAPIKeyError(apiKey, result.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
    showNotification('Gagal terhubung ke server', 'error');
  }
}

// Pastiin display function juga match
function displayAPIKeyResult(apiKey, data) {
  const resultDiv = document.getElementById('apiKeyResult') || createResultElement();
  
  resultDiv.innerHTML = `
    <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin-top: 10px;">
      <h4>✅ API Key Valid</h4>
      <p><strong>Client:</strong> ${data.client_name}</p>
      <p><strong>Email:</strong> ${data.client_email}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Usage:</strong> ${data.requests_used || 0}/${data.request_limit || 'unlimited'}</p>
      <p><strong>Expires:</strong> ${data.expires_at} (${data.daysLeft} hari lagi)</p>
      <p><strong>Last Used:</strong> ${data.last_used || 'Never'}</p>
    </div>
  `;
}

function displayAPIKeyError(apiKey, message) {
  const resultDiv = document.getElementById('apiKeyResult') || createResultElement();
  
  resultDiv.innerHTML = `
    <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin-top: 10px;">
      <h4>❌ API Key Invalid</h4>
      <p><strong>Key:</strong> ${apiKey.substring(0, 10)}...</p>
      <p><strong>Error:</strong> ${message}</p>
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function updateYear() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initializeMobileMenu();
  initializeAPIKeyCheck();
  updateYear();
  
  const forceScrollTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  
  forceScrollTop();
  setTimeout(forceScrollTop, 50);
  setTimeout(forceScrollTop, 200);
  setTimeout(forceScrollTop, 500);
});
