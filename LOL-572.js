// NOTIFICATION SYSTEM - STACKING VERSION
function showNotification(message, type = 'info') {
  // Create notification container if not exists
  let container = document.querySelector('.notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  // Create notification element
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

  // Add to top of container (newest on top)
  if (container.firstChild) {
    container.insertBefore(notification, container.firstChild);
  } else {
    container.appendChild(notification);
  }

  // Auto remove after 4 seconds
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

// Clear all notifications
function clearAllNotifications() {
  const container = document.querySelector('.notification-container');
  if (container) {
    // Animate out all notifications
    const notifications = container.querySelectorAll('.notification');
    notifications.forEach(notification => {
      notification.classList.add('notification-exit');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
    
    // Remove container after animations
    setTimeout(() => {
      if (container.parentNode && container.children.length === 0) {
        container.parentNode.removeChild(container);
      }
    }, 500);
  }
}

// TEST FUNCTION - Bisa dihapus kalo udah work
function testNotifications() {
  showNotification('Test notif 1 - Success', 'success');
  setTimeout(() => showNotification('Test notif 2 - Error', 'error'), 500);
  setTimeout(() => showNotification('Test notif 3 - Warning', 'warning'), 1000);
  setTimeout(() => showNotification('Test notif 4 - Info', 'info'), 1500);
}

// Mobile menu functionality
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

// API Key Check functionality
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
    showNotification('🔍 Memeriksa status API Key...', 'info');
    
    const response = await fetch('https://rulz-xdapi.vercel.app/api/check-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification('✅ API Key valid dan aktif!', 'success');
      displayAPIKeyResult(apiKey, result.data);
    } else {
      showNotification('❌ API Key tidak valid atau tidak ditemukan', 'error');
      displayAPIKeyError(apiKey, result.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
    showNotification('💥 Gagal terhubung ke server', 'error');
  }
}

function displayAPIKeyResult(apiKey, keyDetails) {
  const resultElement = document.getElementById('apiKeyResult');
  const resultContent = document.getElementById('resultContent');
  
  if (!resultElement || !resultContent) return;
  
  let statusClass = 'status-active';
  let statusText = 'AKTIF';
  let statusIcon = 'check-circle';
  
  if (keyDetails.status === 'expired') {
    statusClass = 'status-expired';
    statusText = 'EXPIRED';
    statusIcon = 'times-circle';
  } else if (keyDetails.status === 'revoked') {
    statusClass = 'status-revoked';
    statusText = 'DIBATALKAN';
    statusIcon = 'ban';
  }
  
  resultContent.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold">${keyDetails.client_name || 'Unknown Client'}</h4>
          <p class="text-sm muted">${keyDetails.client_email || 'No email'}</p>
        </div>
        <span class="${statusClass}">
          <i class="fas fa-${statusIcon} mr-1"></i>${statusText}
        </span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div class="font-medium mb-1">📅 Masa Aktif</div>
          <div>Dibuat: ${formatDate(keyDetails.created_at)}</div>
          <div>Kadaluarsa: ${formatDate(keyDetails.expires_at)}</div>
          <div class="${keyDetails.isExpired ? 'text-red-400' : 'text-green-400'} font-medium">
            ${keyDetails.isExpired ? '✅ Sudah kadaluarsa' : `⏳ ${keyDetails.daysLeft} hari lagi`}
          </div>
        </div>
        
        <div>
          <div class="font-medium mb-1">📊 Penggunaan</div>
          <div>Limit: ${keyDetails.request_limit || 0} requests</div>
          <div>Digunakan: ${keyDetails.requests_used || 0} requests</div>
          <div>Tersisa: ${(keyDetails.request_limit || 0) - (keyDetails.requests_used || 0)} requests</div>
        </div>
      </div>
      
      ${keyDetails.notes ? `
      <div>
        <div class="font-medium mb-1">📝 Catatan</div>
        <div class="text-sm muted">${keyDetails.notes}</div>
      </div>
      ` : ''}
      
      <div class="text-xs muted border-t border-white/10 pt-3">
        <div>API Key: <code class="bg-black/20 px-2 py-1 rounded">${apiKey}</code></div>
      </div>
    </div>
  `;
  
  resultElement.classList.remove('hidden');
}

function displayAPIKeyError(apiKey, message) {
  const resultElement = document.getElementById('apiKeyResult');
  const resultContent = document.getElementById('resultContent');
  
  if (!resultElement || !resultContent) return;
  
  resultContent.innerHTML = `
    <div class="text-center py-4">
      <i class="fas fa-exclamation-triangle text-yellow-400 text-3xl mb-3"></i>
      <p class="font-medium">API Key Tidak Ditemukan</p>
      <p class="text-sm muted mt-1">
        <span class="text-with-inline-code">
          API key<code class="bg-black/20 px-2 py-1 rounded">${apiKey}</code> tidak terdaftar di sistem.
        </span>
      </p>
    </div>
  `;
  
  resultElement.classList.remove('hidden');
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

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  initializeMobileMenu();
  initializeAPIKeyCheck();
  updateYear();
  window.scrollTo(0, 0);
  
  // Test notifications - bisa dihapus kalo udah work
  // setTimeout(testNotifications, 1000);
});
