// --- STATE MANAGEMENT ---
let activeType = 'url';
let qrCode = null;
let currentLogoUrl = null;
let soundEnabled = true;
let audioCtx = null;
let isScanning = false;
let html5QrCode = null;

// Default QR Config Object
let qrConfig = {
  width: 500,
  height: 500,
  data: 'https://example.com',
  margin: 10,
  qrOptions: {
    typeNumber: 0,
    mode: 'Byte',
    errorCorrectionLevel: 'H' // Higher level is highly recommended when embedding logos
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.15,
    margin: 5,
    crossOrigin: 'anonymous'
  },
  dotsOptions: {
    color: '#0f172a',
    type: 'square'
  },
  backgroundOptions: {
    color: '#ffffff'
  },
  cornersSquareOptions: {
    color: '#0f172a',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#0f172a',
    type: 'square'
  }
};

// Preset configurations
const PRESETS = {
  'classic-dark': {
    dotsOptions: { color: '#0f172a', type: 'square' },
    cornersSquareOptions: { color: '#0f172a', type: 'square' },
    cornersDotOptions: { color: '#0f172a', type: 'square' },
    backgroundOptions: { color: '#ffffff' }
  },
  'neon-sunset': {
    dotsOptions: {
      type: 'extra-rounded',
      gradient: {
        type: 'linear',
        rotation: 45 * (Math.PI / 180),
        colorStops: [{ offset: 0, color: '#ff007f' }, { offset: 1, color: '#7928ca' }]
      }
    },
    cornersSquareOptions: { color: '#7928ca', type: 'extra-rounded' },
    cornersDotOptions: { color: '#ff007f', type: 'dot' },
    backgroundOptions: { color: '#ffffff' }
  },
  'ocean-breeze': {
    dotsOptions: {
      type: 'classy',
      gradient: {
        type: 'linear',
        rotation: 45 * (Math.PI / 180),
        colorStops: [{ offset: 0, color: '#0070f3' }, { offset: 1, color: '#00dfd8' }]
      }
    },
    cornersSquareOptions: { color: '#0070f3', type: 'rounded' },
    cornersDotOptions: { color: '#00dfd8', type: 'dot' },
    backgroundOptions: { color: '#ffffff' }
  },
  'gold-luxury': {
    dotsOptions: {
      type: 'classy-rounded',
      gradient: {
        type: 'linear',
        rotation: 45 * (Math.PI / 180),
        colorStops: [{ offset: 0, color: '#d4af37' }, { offset: 1, color: '#8a6f48' }]
      }
    },
    cornersSquareOptions: { color: '#d4af37', type: 'rounded' },
    cornersDotOptions: { color: '#d4af37', type: 'dot' },
    backgroundOptions: { color: '#0f1322' }
  },
  'emerald-mint': {
    dotsOptions: {
      type: 'dots',
      gradient: {
        type: 'linear',
        rotation: 45 * (Math.PI / 180),
        colorStops: [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#059669' }]
      }
    },
    cornersSquareOptions: { color: '#059669', type: 'extra-rounded' },
    cornersDotOptions: { color: '#10b981', type: 'dot' },
    backgroundOptions: { color: '#ffffff' }
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Load Lucide Icons
  lucide.createIcons();

  // Initialize QR Code Styling Engine
  qrCode = new QRCodeStyling(qrConfig);
  const canvasHolder = document.getElementById('qr-canvas-holder');
  if (canvasHolder) {
    qrCode.append(canvasHolder);
  }

  // Load local settings & data
  loadLocalSettings();
  renderHistory();

  // Attach Event Listeners
  setupEventListeners();

  // Generate initial QR code & mockups
  setTimeout(() => {
    updateQRCode();
  }, 100);
});

// --- AUDIO UTILITIES (Procedural Synths) ---
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn("Web Audio API not active on user action", e);
  }
}

// --- FLOATING TOAST SYSTEM ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'check-circle' : 'alert-circle';
  toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  lucide.createIcons();

  // Auto remove toast
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// --- LOCAL STORAGE MANAGER ---
function loadLocalSettings() {
  // Dark/Light Theme Preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = '<i data-lucide="sun"></i>';
      lucide.createIcons();
    }
  }

  // Sound preference
  const savedSound = localStorage.getItem('sound_enabled');
  if (savedSound === 'false') {
    soundEnabled = false;
    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML = '<i data-lucide="volume-x"></i>';
      lucide.createIcons();
    }
  }
}

// --- SETUP EVENT LISTENERS ---
function setupEventListeners() {
  // 1. Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSound('click');
      const tabId = btn.getAttribute('data-tab');
      
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');
      
      // Stop scanner if leaving scan tab
      if (tabId !== 'scan-tab' && isScanning) {
        stopCameraScanner();
      }
    });
  });

  // 2. Sound Toggle
  document.getElementById('sound-toggle')?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound_enabled', soundEnabled);
    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML = soundEnabled ? '<i data-lucide="volume-2"></i>' : '<i data-lucide="volume-x"></i>';
      lucide.createIcons();
    }
    showToast(soundEnabled ? 'Sound Enabled' : 'Sound Muted');
    if (soundEnabled) playSound('click');
  });

  // 3. Theme Toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = isLight ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
      lucide.createIcons();
    }
    playSound('click');
    showToast(isLight ? 'Light Theme Activated' : 'Dark Theme Activated');
  });

  // 4. Accordion Toggle
  document.querySelectorAll('.style-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      playSound('click');
      const parent = header.parentElement;
      const isActive = parent.classList.contains('active');
      
      // Close all accordion sections
      document.querySelectorAll('.style-accordion-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Toggle current section
      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });

  // 5. Input content types selector
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const type = btn.getAttribute('data-type');
      activeType = type;

      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.type-form').forEach(f => f.classList.remove('active'));

      btn.classList.add('active');
      const formEl = document.getElementById(`form-${type}`);
      if (formEl) formEl.classList.add('active');

      updateQRCode();
    });
  });

  // 6. Bind live input event listeners for dynamic updates
  const textInputs = [
    'input-url', 'input-text', 'input-wifi-ssid', 'input-wifi-pass',
    'input-vcard-first', 'input-vcard-last', 'input-vcard-phone', 'input-vcard-email', 'input-vcard-org', 'input-vcard-url',
    'input-email-to', 'input-email-subject', 'input-email-body',
    'input-sms-number', 'input-sms-msg', 'input-geo-lat', 'input-geo-lng', 'input-phone-num'
  ];
  textInputs.forEach(id => {
    document.getElementById(id)?.addEventListener('input', debounce(updateQRCode, 300));
  });
  document.getElementById('input-wifi-enc')?.addEventListener('change', updateQRCode);

  // 7. Styling shape selectors
  setupShapeSelector('body-shape-selector', 'dotsOptions', 'type', updateQRCode);
  setupShapeSelector('eye-frame-selector', 'cornersSquareOptions', 'type', updateQRCode);
  setupShapeSelector('eye-ball-selector', 'cornersDotOptions', 'type', updateQRCode);

  // 8. Foreground color selections
  const btnSolid = document.getElementById('btn-color-solid');
  const btnGrad = document.getElementById('btn-color-gradient');
  const fgColor = document.getElementById('fg-color');
  const fgGrad1 = document.getElementById('fg-grad-1');
  const fgGrad2 = document.getElementById('fg-grad-2');
  const gradAngle = document.getElementById('grad-angle');
  const gradType = document.getElementById('grad-type');

  btnSolid?.addEventListener('click', () => {
    playSound('click');
    btnSolid.classList.add('active');
    btnGrad?.classList.remove('active');
    document.getElementById('solid-color-controls')?.classList.add('active');
    document.getElementById('gradient-color-controls')?.classList.remove('active');
    document.getElementById('gradient-color-controls').style.display = 'none';
    document.getElementById('solid-color-controls').style.display = 'block';
    
    // Clear gradient object
    delete qrConfig.dotsOptions.gradient;
    delete qrConfig.cornersSquareOptions.gradient;
    delete qrConfig.cornersDotOptions.gradient;
    
    qrConfig.dotsOptions.color = fgColor.value;
    qrConfig.cornersSquareOptions.color = fgColor.value;
    qrConfig.cornersDotOptions.color = fgColor.value;
    updateQRCode();
  });

  btnGrad?.addEventListener('click', () => {
    playSound('click');
    btnGrad.classList.add('active');
    btnSolid?.classList.remove('active');
    document.getElementById('gradient-color-controls')?.classList.add('active');
    document.getElementById('solid-color-controls')?.classList.remove('active');
    document.getElementById('solid-color-controls').style.display = 'none';
    document.getElementById('gradient-color-controls').style.display = 'block';

    applyGradientStyles();
  });

  fgColor?.addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('fg-color-hex').textContent = val.toUpperCase();
    if (btnSolid.classList.contains('active')) {
      qrConfig.dotsOptions.color = val;
      qrConfig.cornersSquareOptions.color = val;
      qrConfig.cornersDotOptions.color = val;
      updateQRCode();
    }
  });

  const triggerGradUpdate = () => {
    document.getElementById('fg-grad-1-hex').textContent = fgGrad1.value.toUpperCase();
    document.getElementById('fg-grad-2-hex').textContent = fgGrad2.value.toUpperCase();
    if (btnGrad.classList.contains('active')) {
      applyGradientStyles();
    }
  };
  fgGrad1?.addEventListener('input', triggerGradUpdate);
  fgGrad2?.addEventListener('input', triggerGradUpdate);
  gradAngle?.addEventListener('input', triggerGradUpdate);
  gradType?.addEventListener('change', triggerGradUpdate);

  // Background color selection
  const bgColor = document.getElementById('bg-color');
  const bgTransparent = document.getElementById('bg-transparent');

  bgColor?.addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('bg-color-hex').textContent = val.toUpperCase();
    if (!bgTransparent.checked) {
      qrConfig.backgroundOptions.color = val;
      updateQRCode();
    }
  });

  bgTransparent?.addEventListener('change', (e) => {
    playSound('click');
    const row = document.getElementById('bg-color-picker-row');
    if (e.target.checked) {
      row.style.opacity = '0.4';
      row.style.pointerEvents = 'none';
      qrConfig.backgroundOptions.color = 'transparent';
    } else {
      row.style.opacity = '1';
      row.style.pointerEvents = 'all';
      qrConfig.backgroundOptions.color = bgColor.value;
    }
    updateQRCode();
  });

  // 9. Logo Upload
  const logoFile = document.getElementById('logo-file');
  const logoSize = document.getElementById('logo-size');
  const logoCrop = document.getElementById('logo-crop');
  const logoClearBg = document.getElementById('logo-clear-bg');
  const btnRemoveLogo = document.getElementById('btn-remove-logo');

  logoFile?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentLogoUrl = event.target.result;
        processAndSetLogo();
        document.getElementById('logo-controls').style.display = 'block';
        playSound('success');
        showToast('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  });

  logoSize?.addEventListener('input', (e) => {
    qrConfig.imageOptions.imageSize = parseFloat(e.target.value);
    updateQRCode();
  });

  logoCrop?.addEventListener('change', () => {
    processAndSetLogo();
  });

  logoClearBg?.addEventListener('change', (e) => {
    qrConfig.imageOptions.hideBackgroundDots = e.target.checked;
    updateQRCode();
  });

  btnRemoveLogo?.addEventListener('click', () => {
    playSound('click');
    currentLogoUrl = null;
    qrConfig.image = null;
    logoFile.value = '';
    document.getElementById('logo-controls').style.display = 'none';
    updateQRCode();
    showToast('Logo removed');
  });

  // 10. Advanced Settings
  document.getElementById('qr-margin')?.addEventListener('input', (e) => {
    qrConfig.margin = parseInt(e.target.value) || 0;
    updateQRCode();
  });

  document.getElementById('qr-error-correction')?.addEventListener('change', (e) => {
    qrConfig.qrOptions.errorCorrectionLevel = e.target.value;
    updateQRCode();
  });

  // 11. Presets Click handler
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('success');
      const presetName = btn.getAttribute('data-preset');
      const preset = PRESETS[presetName];
      if (preset) {
        // Apply presets to configuration
        qrConfig.dotsOptions = { ...qrConfig.dotsOptions, ...preset.dotsOptions };
        qrConfig.cornersSquareOptions = { ...qrConfig.cornersSquareOptions, ...preset.cornersSquareOptions };
        qrConfig.cornersDotOptions = { ...qrConfig.cornersDotOptions, ...preset.cornersDotOptions };
        qrConfig.backgroundOptions = { ...qrConfig.backgroundOptions, ...preset.backgroundOptions };

        // Synchronize UI settings
        syncUIToConfig();
        updateQRCode();
        showToast(`Preset "${btn.querySelector('.preset-card-title').textContent}" applied!`);
      }
    });
  });

  // 12. Resolution Slider
  const resolutionSlider = document.getElementById('qr-resolution');
  resolutionSlider?.addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('label-resolution').textContent = `${val} px`;
  });

  // 13. Download & Action Handlers
  document.getElementById('btn-download-png')?.addEventListener('click', () => downloadQR('png'));
  document.getElementById('btn-download-svg')?.addEventListener('click', () => downloadQR('svg'));
  document.getElementById('btn-download-jpg')?.addEventListener('click', () => downloadQR('jpeg'));
  document.getElementById('btn-save-preset')?.addEventListener('click', savePresetToHistory);
  document.getElementById('btn-copy-clipboard')?.addEventListener('click', copyQRToClipboard);

  // 14. Mockup Navigation Tabs
  document.querySelectorAll('.mockup-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const item = btn.getAttribute('data-mockup');
      
      document.querySelectorAll('.mockup-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.mockup-container').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`mockup-${item}-container`).classList.add('active');
    });
  });

  // 15. SCANNER SECTION EVENTS
  const btnStartCam = document.getElementById('btn-start-camera');
  const btnStopCam = document.getElementById('btn-stop-camera');
  const btnShowFileScan = document.getElementById('btn-show-file-scanner');
  const fileDropZone = document.getElementById('file-drop-scanner-view');
  const fileScanInput = document.getElementById('file-scan-input');
  const btnCopyScan = document.getElementById('btn-copy-scan-result');
  const btnOpenScanLink = document.getElementById('btn-open-scan-link');

  btnStartCam?.addEventListener('click', () => {
    playSound('click');
    startCameraScanner();
  });

  btnStopCam?.addEventListener('click', () => {
    playSound('click');
    stopCameraScanner();
  });

  btnShowFileScan?.addEventListener('click', () => {
    playSound('click');
    stopCameraScanner();
    fileScanInput.click();
  });

  fileScanInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      processScanFile(file);
    }
  });

  // Drag and drop events for file scanner
  fileDropZone?.addEventListener('click', () => {
    stopCameraScanner();
    fileScanInput.click();
  });

  fileDropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('dragover');
  });

  fileDropZone?.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('dragover');
  });

  fileDropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      processScanFile(file);
    }
  });

  btnCopyScan?.addEventListener('click', () => {
    const text = document.getElementById('scan-result-text').textContent;
    if (text && text !== 'Waiting for scanned QR code...' && text !== 'Error: Could not decode QR code. Please try a cleaner image.') {
      navigator.clipboard.writeText(text);
      playSound('success');
      showToast('Scanned result copied!');
    }
  });

  btnOpenScanLink?.addEventListener('click', () => {
    const text = document.getElementById('scan-result-text').textContent;
    if (text && text.startsWith('http')) {
      playSound('success');
      window.open(text, '_blank');
    }
  });

  // 16. BATCH GENERATOR EVENTS
  document.getElementById('btn-generate-batch')?.addEventListener('click', generateBatchQRCodes);

  // 17. HISTORY ACTIONS
  document.getElementById('btn-clear-history')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your saved QR templates?')) {
      playSound('click');
      localStorage.removeItem('qr_studio_history');
      renderHistory();
      showToast('History cleared', 'success');
    }
  });
}

// --- CONFIG SYNCHRONIZATION HELPERS ---
function setupShapeSelector(containerId, optionsKey, propertyName, callback) {
  const container = document.getElementById(containerId);
  container?.addEventListener('click', (e) => {
    const btn = e.target.closest('.shape-btn');
    if (btn) {
      playSound('click');
      container.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const val = btn.getAttribute(`data-${btn.attributes[1].name.substring(5)}`);
      qrConfig[optionsKey][propertyName] = val;
      callback();
    }
  });
}

function applyGradientStyles() {
  const fgGrad1 = document.getElementById('fg-grad-1').value;
  const fgGrad2 = document.getElementById('fg-grad-2').value;
  const angle = parseFloat(document.getElementById('grad-angle').value) || 0;
  const type = document.getElementById('grad-type').value;

  const gradient = {
    type: type,
    rotation: angle * (Math.PI / 180),
    colorStops: [
      { offset: 0, color: fgGrad1 },
      { offset: 1, color: fgGrad2 }
    ]
  };

  qrConfig.dotsOptions.gradient = gradient;
  qrConfig.cornersSquareOptions.gradient = gradient;
  qrConfig.cornersDotOptions.gradient = gradient;

  // Remove solid color overrides so gradient takes priority
  delete qrConfig.dotsOptions.color;
  delete qrConfig.cornersSquareOptions.color;
  delete qrConfig.cornersDotOptions.color;

  updateQRCode();
}

function syncUIToConfig() {
  // Synchronize body shape
  const bodyShape = qrConfig.dotsOptions.type;
  document.querySelectorAll('#body-shape-selector .shape-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-shape') === bodyShape);
  });

  // Synchronize eye corner shapes
  const eyeFrame = qrConfig.cornersSquareOptions.type;
  document.querySelectorAll('#eye-frame-selector .shape-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-eye-frame') === eyeFrame);
  });

  const eyeBall = qrConfig.cornersDotOptions.type;
  document.querySelectorAll('#eye-ball-selector .shape-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-eye-ball') === eyeBall);
  });

  // Synchronize colors UI
  const isTransparent = qrConfig.backgroundOptions.color === 'transparent';
  document.getElementById('bg-transparent').checked = isTransparent;
  const bgRow = document.getElementById('bg-color-picker-row');
  if (isTransparent) {
    bgRow.style.opacity = '0.4';
    bgRow.style.pointerEvents = 'none';
  } else {
    bgRow.style.opacity = '1';
    bgRow.style.pointerEvents = 'all';
    document.getElementById('bg-color').value = qrConfig.backgroundOptions.color;
    document.getElementById('bg-color-hex').textContent = qrConfig.backgroundOptions.color.toUpperCase();
  }

  const hasGradient = !!qrConfig.dotsOptions.gradient;
  document.getElementById('btn-color-gradient').classList.toggle('active', hasGradient);
  document.getElementById('btn-color-solid').classList.toggle('active', !hasGradient);

  if (hasGradient) {
    document.getElementById('solid-color-controls').style.display = 'none';
    document.getElementById('gradient-color-controls').style.display = 'block';
    
    const grad = qrConfig.dotsOptions.gradient;
    if (grad.colorStops && grad.colorStops.length >= 2) {
      document.getElementById('fg-grad-1').value = grad.colorStops[0].color;
      document.getElementById('fg-grad-2').value = grad.colorStops[1].color;
      document.getElementById('fg-grad-1-hex').textContent = grad.colorStops[0].color.toUpperCase();
      document.getElementById('fg-grad-2-hex').textContent = grad.colorStops[1].color.toUpperCase();
    }
    document.getElementById('grad-angle').value = Math.round(grad.rotation * (180 / Math.PI)) || 0;
    document.getElementById('grad-type').value = grad.type;
  } else {
    document.getElementById('solid-color-controls').style.display = 'block';
    document.getElementById('gradient-color-controls').style.display = 'none';
    
    const color = qrConfig.dotsOptions.color || '#000000';
    document.getElementById('fg-color').value = color;
    document.getElementById('fg-color-hex').textContent = color.toUpperCase();
  }
}

// --- LOGO PROCESSING (Canvas Circular Crop) ---
function processAndSetLogo() {
  if (!currentLogoUrl) return;

  const cropType = document.getElementById('logo-crop').value;
  if (cropType === 'circle') {
    cropLogoToCircle(currentLogoUrl, (croppedUrl) => {
      qrConfig.image = croppedUrl;
      updateQRCode();
    });
  } else if (cropType === 'square') {
    cropLogoToSquareFrame(currentLogoUrl, (croppedUrl) => {
      qrConfig.image = croppedUrl;
      updateQRCode();
    });
  } else {
    qrConfig.image = currentLogoUrl;
    updateQRCode();
  }
}

function cropLogoToCircle(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const size = Math.min(img.width, img.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw centered square from image
    ctx.drawImage(img, (img.width - size) / -2, (img.height - size) / -2);
    callback(canvas.toDataURL());
  };
  img.src = dataUrl;
}

function cropLogoToSquareFrame(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const size = Math.max(img.width, img.height);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fill white background frame
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Draw centered image with padding
    const pad = size * 0.1;
    const drawSize = size - (pad * 2);
    const wRatio = drawSize / img.width;
    const hRatio = drawSize / img.height;
    const ratio = Math.min(wRatio, hRatio);
    
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (size - w) / 2;
    const y = (size - h) / 2;
    
    ctx.drawImage(img, x, y, w, h);
    callback(canvas.toDataURL());
  };
  img.src = dataUrl;
}

// --- DYNAMIC DATA FORMATTERS (Permanent QR Standard) ---
function compileQRCodeData() {
  switch (activeType) {
    case 'url':
      return document.getElementById('input-url').value.trim() || 'https://example.com';
    case 'text':
      return document.getElementById('input-text').value || '';
    case 'wifi':
      const ssid = document.getElementById('input-wifi-ssid').value.trim();
      const pass = document.getElementById('input-wifi-pass').value;
      const enc = document.getElementById('input-wifi-enc').value;
      // Format: WIFI:T:WPA;S:MyNetworkSSID;P:MyPassword;;
      return `WIFI:T:${enc};S:${escapeWifiString(ssid)};P:${escapeWifiString(pass)};;`;
    case 'vcard':
      const first = document.getElementById('input-vcard-first').value.trim();
      const last = document.getElementById('input-vcard-last').value.trim();
      const phone = document.getElementById('input-vcard-phone').value.trim();
      const email = document.getElementById('input-vcard-email').value.trim();
      const org = document.getElementById('input-vcard-org').value.trim();
      const cardUrl = document.getElementById('input-vcard-url').value.trim();
      
      // Build proper RFC 6350 VCard
      return `BEGIN:VCARD\nVERSION:3.0\nN:${last};${first};;;\nFN:${first} ${last}\nORG:${org}\nTEL;TYPE=CELL,VOICE:${phone}\nEMAIL;TYPE=PREF,INTERNET:${email}\nURL:${cardUrl}\nEND:VCARD`;
    case 'email':
      const to = document.getElementById('input-email-to').value.trim();
      const sub = document.getElementById('input-email-subject').value.trim();
      const body = document.getElementById('input-email-body').value;
      return `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
    case 'sms':
      const num = document.getElementById('input-sms-number').value.trim();
      const msg = document.getElementById('input-sms-msg').value;
      // Standard: SMSTO:number:message
      return `SMSTO:${num}:${msg}`;
    case 'geo':
      const lat = document.getElementById('input-geo-lat').value.trim() || '0';
      const lng = document.getElementById('input-geo-lng').value.trim() || '0';
      return `geo:${lat},${lng}`;
    case 'phone':
      const pNum = document.getElementById('input-phone-num').value.trim();
      return `tel:${pNum}`;
    default:
      return 'https://example.com';
  }
}

function escapeWifiString(val) {
  if (!val) return '';
  return val.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/,/g, '\\,');
}

// --- ENGINE UPDATE WRAPPER ---
function updateQRCode() {
  const spinner = document.getElementById('qr-spinner');
  if (spinner) spinner.classList.add('active');

  const compiledData = compileQRCodeData();
  qrConfig.data = compiledData;

  // Trigger engine update
  qrCode.update(qrConfig);

  // Sync to physical mockups asynchronously so page UI stays fluid
  setTimeout(syncMockupImages, 450);
}

function syncMockupImages() {
  // Extract generated canvas data URLs and inject in 3D previews
  qrCode.getRawData('png').then((blob) => {
    const url = URL.createObjectURL(blob);
    const mockups = ['phone-img', 'card-img', 'mug-img', 'tshirt-img', 'flyer-img'];
    
    mockups.forEach(id => {
      const el = document.getElementById(`mockup-${id}`);
      if (el) {
        // Revoke old URL to prevent memory leakage
        if (el.src && el.src.startsWith('blob:')) {
          URL.revokeObjectURL(el.src);
        }
        el.src = url;
      }
    });

    const spinner = document.getElementById('qr-spinner');
    if (spinner) spinner.classList.remove('active');
  }).catch(err => {
    console.error('Failed to sync mockup canvases', err);
    const spinner = document.getElementById('qr-spinner');
    if (spinner) spinner.classList.remove('active');
  });
}

// --- DOWNLOAD UTILITIES ---
function downloadQR(format = 'png') {
  playSound('success');
  const resInput = parseInt(document.getElementById('qr-resolution').value) || 500;
  
  // Create temp copy with updated size for export
  const downloadConfig = { ...qrConfig, width: resInput, height: resInput };
  const exportQr = new QRCodeStyling(downloadConfig);
  
  // Format filename cleanly
  let name = `qr-code-${Date.now()}`;
  if (activeType === 'url') {
    const rawUrl = document.getElementById('input-url').value;
    try { name = new URL(rawUrl).hostname.replace('www.', ''); } catch(e) {}
  }
  
  exportQr.download({ name: name, extension: format });
  showToast(`QR Code saved as ${format.toUpperCase()}`);
}

async function copyQRToClipboard() {
  try {
    const rawData = await qrCode.getRawData('png');
    const item = new ClipboardItem({ [rawData.type]: rawData });
    await navigator.clipboard.write([item]);
    playSound('success');
    showToast('Copied QR Image to clipboard!');
  } catch (err) {
    playSound('error');
    showToast('Failed to copy. Try downloading as PNG.', 'error');
    console.error(err);
  }
}

// --- HISTORICAL PRESETS & SAVES ---
function savePresetToHistory() {
  playSound('success');
  
  // Capture low-resolution PNG thumbnail (100px) to keep localStorage lightweight
  const thumbConfig = { ...qrConfig, width: 120, height: 120, margin: 4 };
  if (thumbConfig.imageOptions) thumbConfig.imageOptions.imageSize = 0.12;
  const thumbQr = new QRCodeStyling(thumbConfig);
  
  thumbQr.getRawData('png').then((blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const thumbBase64 = reader.result;
      
      const historyItem = {
        id: Date.now(),
        title: getHistoryTitle(),
        desc: compileQRCodeData(),
        type: activeType,
        date: new Date().toLocaleDateString(),
        config: JSON.parse(JSON.stringify(qrConfig)), // deep copy configuration object
        thumb: thumbBase64
      };

      let currentHistory = JSON.parse(localStorage.getItem('qr_studio_history') || '[]');
      // Limit history to 30 items
      currentHistory.unshift(historyItem);
      if (currentHistory.length > 30) {
        currentHistory.pop();
      }
      
      localStorage.setItem('qr_studio_history', JSON.stringify(currentHistory));
      renderHistory();
      showToast('Template saved to History!');
    };
    reader.readAsDataURL(blob);
  });
}

function getHistoryTitle() {
  switch (activeType) {
    case 'url':
      return document.getElementById('input-url').value || 'Link';
    case 'text':
      const txt = document.getElementById('input-text').value || 'Text Content';
      return txt.substring(0, 25) + (txt.length > 25 ? '...' : '');
    case 'wifi':
      return `Wi-Fi: ${document.getElementById('input-wifi-ssid').value}`;
    case 'vcard':
      return `vCard: ${document.getElementById('input-vcard-first').value} ${document.getElementById('input-vcard-last').value}`;
    case 'email':
      return `Email: ${document.getElementById('input-email-to').value}`;
    case 'sms':
      return `SMS to ${document.getElementById('input-sms-number').value}`;
    case 'geo':
      return `Geo: ${document.getElementById('input-geo-lat').value}, ${document.getElementById('input-geo-lng').value}`;
    case 'phone':
      return `Phone: ${document.getElementById('input-phone-num').value}`;
  }
}

function renderHistory() {
  const container = document.getElementById('history-items-grid');
  if (!container) return;

  const currentHistory = JSON.parse(localStorage.getItem('qr_studio_history') || '[]');
  
  if (currentHistory.length === 0) {
    container.innerHTML = `
      <div class="history-empty-state">
        <i data-lucide="archive"></i>
        <p style="font-weight: 600;">No templates saved yet</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 300px;">
          Create designs and click "Save Template" in the Create tab to cache your work here.
        </p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = '';
  
  currentHistory.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    // Map type to icons
    let typeIcon = 'link';
    if (item.type === 'wifi') typeIcon = 'wifi';
    if (item.type === 'vcard') typeIcon = 'contact';
    if (item.type === 'text') typeIcon = 'align-left';
    if (item.type === 'email') typeIcon = 'mail';
    if (item.type === 'sms') typeIcon = 'message-square-text';
    if (item.type === 'geo') typeIcon = 'map-pin';
    if (item.type === 'phone') typeIcon = 'phone';

    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-card-type"><i data-lucide="${typeIcon}"></i> ${item.type}</span>
        <span class="history-card-date">${item.date}</span>
      </div>
      <div class="history-card-body">
        <div class="history-card-thumb">
          <img src="${item.thumb}" alt="QR code thumbnail">
        </div>
        <div class="history-card-details">
          <span class="history-card-title">${escapeHTML(item.title)}</span>
          <span class="history-card-desc" title="${escapeHTML(item.desc)}">${escapeHTML(item.desc)}</span>
        </div>
      </div>
      <div class="history-card-actions">
        <button class="btn-icon-small btn-load" data-id="${item.id}" title="Load configuration back to studio">
          <i data-lucide="folder-open"></i>
        </button>
        <button class="btn-icon-small btn-download" data-id="${item.id}" title="Download PNG">
          <i data-lucide="download"></i>
        </button>
        <button class="btn-icon-small btn-delete" data-id="${item.id}" title="Delete template">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });

  lucide.createIcons();

  // Attach card event listeners
  container.querySelectorAll('.btn-load').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseFloat(btn.getAttribute('data-id'));
      loadPresetFromHistory(id);
    });
  });

  container.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseFloat(btn.getAttribute('data-id'));
      const item = currentHistory.find(i => i.id === id);
      if (item) {
        playSound('success');
        const dlQr = new QRCodeStyling(item.config);
        dlQr.download({ name: `qr-${item.type}-${item.id}`, extension: 'png' });
        showToast('Downloaded template QR!');
      }
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const id = parseFloat(btn.getAttribute('data-id'));
      let currentHistory = JSON.parse(localStorage.getItem('qr_studio_history') || '[]');
      currentHistory = currentHistory.filter(item => item.id !== id);
      localStorage.setItem('qr_studio_history', JSON.stringify(currentHistory));
      renderHistory();
      showToast('Template deleted');
    });
  });
}

function loadPresetFromHistory(id) {
  const currentHistory = JSON.parse(localStorage.getItem('qr_studio_history') || '[]');
  const item = currentHistory.find(i => i.id === id);
  if (!item) return;

  playSound('success');
  qrConfig = item.config;
  activeType = item.type;
  currentLogoUrl = qrConfig.image || null;

  // Restore dynamic inputs based on type
  restoreInputsFromData(item.type, item.desc);

  // Sync Tabs
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === 'create-tab');
  });
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === 'create-tab');
  });

  // Sync Form Selector
  document.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-type') === item.type);
  });
  document.querySelectorAll('.type-form').forEach(f => {
    f.classList.toggle('active', f.id === `form-${item.type}`);
  });

  // Sync logo controllers
  if (currentLogoUrl) {
    document.getElementById('logo-controls').style.display = 'block';
  } else {
    document.getElementById('logo-controls').style.display = 'none';
    document.getElementById('logo-file').value = '';
  }

  syncUIToConfig();
  updateQRCode();
  showToast('Configuration loaded into Studio!');
}

function restoreInputsFromData(type, desc) {
  try {
    switch (type) {
      case 'url':
        document.getElementById('input-url').value = desc;
        break;
      case 'text':
        document.getElementById('input-text').value = desc;
        break;
      case 'phone':
        document.getElementById('input-phone-num').value = desc.replace('tel:', '');
        break;
      case 'sms':
        // Format: SMSTO:number:message
        const smsParts = desc.match(/^SMSTO:([^:]+):(.*)$/s);
        if (smsParts) {
          document.getElementById('input-sms-number').value = smsParts[1];
          document.getElementById('input-sms-msg').value = smsParts[2];
        } else {
          document.getElementById('input-sms-msg').value = desc;
        }
        break;
      case 'email':
        // Format: mailto:to?subject=sub&body=b
        const emailUrl = new URL(desc);
        document.getElementById('input-email-to').value = emailUrl.pathname;
        const params = new URLSearchParams(emailUrl.search);
        document.getElementById('input-email-subject').value = params.get('subject') || '';
        document.getElementById('input-email-body').value = params.get('body') || '';
        break;
      case 'wifi':
        // Format: WIFI:T:WPA;S:SSID;P:PASS;;
        const ssidMatch = desc.match(/S:((?:[^;]|\\;)+);/);
        const passMatch = desc.match(/P:((?:[^;]|\\;)+);/);
        const encMatch = desc.match(/T:((?:[^;]|\\;)+);/);
        
        if (ssidMatch) document.getElementById('input-wifi-ssid').value = unescapeWifiString(ssidMatch[1]);
        if (passMatch) document.getElementById('input-wifi-pass').value = unescapeWifiString(passMatch[1]);
        if (encMatch) document.getElementById('input-wifi-enc').value = encMatch[1];
        break;
      case 'geo':
        // Format: geo:lat,lng
        const geoMatch = desc.replace('geo:', '').split(',');
        if (geoMatch.length >= 2) {
          document.getElementById('input-geo-lat').value = geoMatch[0];
          document.getElementById('input-geo-lng').value = geoMatch[1];
        }
        break;
      case 'vcard':
        // Parse simple vcard fields
        const lines = desc.split('\n');
        lines.forEach(line => {
          if (line.startsWith('FN:')) document.getElementById('input-vcard-first').value = line.replace('FN:', '').split(' ')[0] || '';
          if (line.startsWith('N:')) {
            const parts = line.replace('N:', '').split(';');
            document.getElementById('input-vcard-last').value = parts[0] || '';
            document.getElementById('input-vcard-first').value = parts[1] || '';
          }
          if (line.startsWith('TEL;')) {
            const parts = line.split(':');
            document.getElementById('input-vcard-phone').value = parts[1] || '';
          }
          if (line.startsWith('EMAIL;')) {
            const parts = line.split(':');
            document.getElementById('input-vcard-email').value = parts[1] || '';
          }
          if (line.startsWith('ORG:')) document.getElementById('input-vcard-org').value = line.replace('ORG:', '');
          if (line.startsWith('URL:')) document.getElementById('input-vcard-url').value = line.replace('URL:', '');
        });
        break;
    }
  } catch (e) {
    console.warn('Could not fully parse restored data structure', e);
  }
}

function unescapeWifiString(val) {
  if (!val) return '';
  return val.replace(/\\\\/g, '\\').replace(/\\;/g, ';').replace(/\\:/g, ':').replace(/\\,/g, ',');
}

// --- SCANNING SYSTEM CODE ---
function startCameraScanner() {
  initAudio();
  const reader = document.getElementById('reader');
  const view = document.getElementById('camera-scanner-view');
  const dropZone = document.getElementById('file-drop-scanner-view');
  
  if (!reader || isScanning) return;

  view.style.display = 'block';
  dropZone.style.display = 'none';
  document.getElementById('btn-start-camera').style.display = 'none';
  document.getElementById('btn-stop-camera').style.display = 'inline-flex';
  document.getElementById('scanner-laser-line').classList.add('active');

  isScanning = true;
  html5QrCode = new Html5Qrcode('reader');

  html5QrCode.start(
    { facingMode: 'environment' }, 
    {
      fps: 10,
      qrbox: (width, height) => {
        const size = Math.min(width, height) * 0.7;
        return { width: size, height: size };
      }
    },
    (decodedText) => {
      // Success scan
      playSound('success');
      showToast('QR Code Decoded!');
      handleScanResult(decodedText);
      stopCameraScanner();
    },
    (errorMessage) => {
      // Quietly ignore scan frame drops
    }
  ).catch(err => {
    playSound('error');
    console.error('Camera Scan Start Error', err);
    showToast('Failed to access camera', 'error');
    stopCameraScanner();
  });
}

function stopCameraScanner() {
  const view = document.getElementById('camera-scanner-view');
  const dropZone = document.getElementById('file-drop-scanner-view');
  
  view.style.display = 'none';
  dropZone.style.display = 'flex';
  document.getElementById('btn-start-camera').style.display = 'inline-flex';
  document.getElementById('btn-stop-camera').style.display = 'none';
  document.getElementById('scanner-laser-line').classList.remove('active');

  isScanning = false;

  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
    }).catch(err => {
      console.warn('Could not stop scanner clean', err);
    });
  }
}

function processScanFile(file) {
  initAudio();
  const tempScanner = new Html5Qrcode('reader');
  tempScanner.scanFile(file, true)
    .then(decodedText => {
      playSound('success');
      showToast('QR Code Decoded!');
      handleScanResult(decodedText);
      tempScanner.clear();
    })
    .catch(err => {
      playSound('error');
      console.error(err);
      handleScanResult(null);
      tempScanner.clear();
    });
}

function handleScanResult(text) {
  const resultBox = document.getElementById('scan-result-text');
  const btnCopy = document.getElementById('btn-copy-scan-result');
  const btnOpen = document.getElementById('btn-open-scan-link');

  if (text) {
    resultBox.textContent = text;
    btnCopy.disabled = false;
    
    // Check if URL
    if (text.startsWith('http://') || text.startsWith('https://')) {
      btnOpen.disabled = false;
    } else {
      btnOpen.disabled = true;
    }
  } else {
    resultBox.textContent = 'Error: Could not decode QR code. Please try a cleaner image.';
    btnCopy.disabled = true;
    btnOpen.disabled = true;
  }
}

// --- BATCH GENERATOR CODE ---
async function generateBatchQRCodes() {
  initAudio();
  const listArea = document.getElementById('batch-textarea');
  const lines = listArea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) {
    playSound('error');
    showToast('Please enter at least one line of text/URL', 'error');
    return;
  }

  const logBox = document.getElementById('batch-log-box');
  const progressPanel = document.getElementById('batch-progress-panel');
  const progressBar = document.getElementById('batch-progress-bar');
  const progressStatus = document.getElementById('batch-progress-status');
  const progressCount = document.getElementById('batch-progress-count');

  logBox.textContent = '';
  progressPanel.style.display = 'flex';
  progressBar.style.width = '0%';
  progressStatus.textContent = 'Initializing Batch...';
  progressCount.textContent = `0/${lines.length}`;

  const customNaming = document.getElementById('batch-naming-custom').checked;
  const zip = new JSZip();

  logBox.textContent += `Starting production sequence for ${lines.length} items...\n`;
  
  try {
    for (let i = 0; i < lines.length; i++) {
      const itemData = lines[i];
      progressStatus.textContent = `Rendering QR code ${i + 1}...`;
      progressCount.textContent = `${i + 1}/${lines.length}`;
      progressBar.style.width = `${((i + 1) / lines.length) * 100}%`;
      
      logBox.textContent += `Rendering QR ${i + 1}: ${itemData.substring(0, 30)}${itemData.length > 30 ? '...' : ''}\n`;
      logBox.scrollTop = logBox.scrollHeight;

      // Make a unique engine configuration instance matching active style
      const singleConfig = {
        ...qrConfig,
        width: 600,
        height: 600,
        data: itemData
      };
      
      const batchQr = new QRCodeStyling(singleConfig);
      const blob = await batchQr.getRawData('png');
      
      // Determine file name
      let filename = `qr-${i + 1}.png`;
      if (!customNaming) {
        // Clean special characters from file names
        const cleanName = itemData.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        filename = `${cleanName || `qr-${i + 1}`}.png`;
      }
      
      zip.file(filename, blob);
    }
    
    progressStatus.textContent = 'Packaging zip file...';
    logBox.textContent += 'Compiling ZIP archive...\n';
    logBox.scrollTop = logBox.scrollHeight;

    const zipContent = await zip.generateAsync({ type: 'blob' });
    
    // Trigger download
    const zipName = `qr-studio-batch-${Date.now()}.zip`;
    const url = URL.createObjectURL(zipContent);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    playSound('success');
    progressStatus.textContent = 'Completed!';
    logBox.textContent += `\nSuccess! Batch file "${zipName}" downloaded successfully.\n`;
    logBox.scrollTop = logBox.scrollHeight;
    showToast('Batch generation successful!');
  } catch (err) {
    playSound('error');
    console.error('Batch error', err);
    progressStatus.textContent = 'Failed';
    logBox.textContent += `\nError during batch generation: ${err.message}\n`;
    logBox.scrollTop = logBox.scrollHeight;
    showToast('Batch generation failed!', 'error');
  }
}

// --- GENERAL UTILITIES ---
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
