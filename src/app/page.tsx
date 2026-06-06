'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Volume2, VolumeX, Moon, Sun, QrCode, ScanLine, Layers, History,
  Link as LinkIcon, AlignLeft, Wifi, Contact, Mail, MessageSquareText, 
  MapPin, Phone, ChevronDown, Trash2, Palette, Settings, Eye, 
  Download, FileCode, ImageIcon, Save, Copy, Shirt, 
  Video, VideoOff, FileUp, Terminal, ExternalLink, PackageOpen, 
  Archive, CheckCircle2, AlertTriangle, MoonStar
} from 'lucide-react';

export default function Home() {
  // --- CLIENT-SIDE DYNAMIC PACKAGE LOADERS ---
  const [QRCodeStyling, setQRCodeStyling] = useState<any>(null);
  const [Html5Qrcode, setHtml5Qrcode] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Dynamically load client-only modules to prevent SSR crashes
    import('qr-code-styling').then((mod) => setQRCodeStyling(mod.default));
    import('html5-qrcode').then((mod) => setHtml5Qrcode(mod.Html5Qrcode));
  }, []);

  // --- STATE VARIABLES ---
  const [activeTab, setActiveTab] = useState<'create-tab' | 'scan-tab' | 'batch-tab' | 'history-tab'>('create-tab');
  const [activeType, setActiveType] = useState<'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'geo' | 'phone'>('url');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [accordionActive, setAccordionActive] = useState<string>('body');
  
  // Custom QR shape styles
  const [bodyShape, setBodyShape] = useState<string>('square');
  const [eyeFrame, setEyeFrame] = useState<string>('square');
  const [eyeBall, setEyeBall] = useState<string>('square');
  
  // Custom QR colors
  const [colorType, setColorType] = useState<'solid' | 'gradient'>('solid');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [fgGrad1, setFgGrad1] = useState('#6366f1');
  const [fgGrad2, setFgGrad2] = useState('#ec4899');
  const [gradAngle, setGradAngle] = useState(45);
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
  const [bgTransparent, setBgTransparent] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  
  // Logo upload styles
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.15);
  const [logoCrop, setLogoCrop] = useState<'none' | 'circle' | 'square'>('none');
  const [logoClearBg, setLogoClearBg] = useState(true);
  const [logoCroppedUrl, setLogoCroppedUrl] = useState<string | null>(null);

  // Advanced QR Settings
  const [margin, setMargin] = useState(10);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [resolution, setResolution] = useState(500);

  // Mockup Tab
  const [activeMockup, setActiveMockup] = useState<'phone' | 'card' | 'mug' | 'tshirt' | 'flyer'>('phone');
  const [mockupUrl, setMockupUrl] = useState<string>('');

  // Input fields state
  const [inputUrl, setInputUrl] = useState('https://example.com');
  const [inputText, setInputText] = useState('');
  
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');

  const [vcardFirst, setVcardFirst] = useState('');
  const [vcardLast, setVcardLast] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [smsNumber, setSmsNumber] = useState('');
  const [smsMsg, setSmsMsg] = useState('');

  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');

  const [phoneNum, setPhoneNum] = useState('');

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('Waiting for scanned QR code...');
  const [dragOver, setDragOver] = useState(false);

  // Batch States
  const [batchText, setBatchText] = useState('');
  const [batchNamingCustom, setBatchNamingCustom] = useState(false);
  const [batchProgressShow, setBatchProgressShow] = useState(false);
  const [batchProgressStatus, setBatchProgressStatus] = useState('Preparing...');
  const [batchProgressPercent, setBatchProgressPercent] = useState(0);
  const [batchProgressCount, setBatchProgressCount] = useState('0/0');
  const [batchLogs, setBatchLogs] = useState('Idle. Add items and click Generate.');

  // History / Presets
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Floating notifications
  const [toasts, setToasts] = useState<any[]>([]);

  // --- REFS ---
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileScanInputRef = useRef<HTMLInputElement>(null);
  const cameraScannerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- AUDIO SYNTH PROCEDURAL SOUNDS ---
  const playSound = (type: 'click' | 'success' | 'error') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context init blocked until interaction", e);
    }
  };

  // --- TOAST NOTIFICATIONS ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, fade: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3000);
  };

  // --- COMPILE QR DATA standard static format ---
  const compileQRCodeData = (): string => {
    switch (activeType) {
      case 'url':
        return inputUrl.trim() || 'https://example.com';
      case 'text':
        return inputText || '';
      case 'wifi':
        const escapeW = (val: string) => val.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/,/g, '\\,');
        return `WIFI:T:${wifiEnc};S:${escapeW(wifiSsid.trim())};P:${escapeW(wifiPass)};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardLast.trim()};${vcardFirst.trim()};;;\nFN:${vcardFirst.trim()} ${vcardLast.trim()}\nORG:${vcardOrg.trim()}\nTEL;TYPE=CELL,VOICE:${vcardPhone.trim()}\nEMAIL;TYPE=PREF,INTERNET:${vcardEmail.trim()}\nURL:${vcardUrl.trim()}\nEND:VCARD`;
      case 'email':
        return `mailto:${emailTo.trim()}?subject=${encodeURIComponent(emailSubject.trim())}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `SMSTO:${smsNumber.trim()}:${smsMsg}`;
      case 'geo':
        return `geo:${geoLat.trim() || '0'},${geoLng.trim() || '0'}`;
      case 'phone':
        return `tel:${phoneNum.trim()}`;
      default:
        return 'https://example.com';
    }
  };

  // --- COMPILE ENGINE OPTION OBJECT ---
  const getQRConfig = (overrideData?: string, overrideRes?: number) => {
    const activeData = overrideData || compileQRCodeData();
    const res = overrideRes || resolution;

    const baseGrad = {
      type: gradType,
      rotation: gradAngle * (Math.PI / 180),
      colorStops: [
        { offset: 0, color: fgGrad1 },
        { offset: 1, color: fgGrad2 }
      ]
    };

    return {
      width: res,
      height: res,
      data: activeData,
      margin: margin,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: errorCorrection
      },
      image: logoCroppedUrl || undefined,
      imageOptions: {
        hideBackgroundDots: logoClearBg,
        imageSize: logoSize,
        margin: 5,
        crossOrigin: 'anonymous'
      },
      dotsOptions: {
        type: bodyShape,
        color: colorType === 'solid' ? fgColor : undefined,
        gradient: colorType === 'gradient' ? baseGrad : undefined
      },
      backgroundOptions: {
        color: bgTransparent ? 'transparent' : bgColor
      },
      cornersSquareOptions: {
        type: eyeFrame,
        color: colorType === 'solid' ? fgColor : undefined,
        gradient: colorType === 'gradient' ? baseGrad : undefined
      },
      cornersDotOptions: {
        type: eyeBall,
        color: colorType === 'solid' ? fgColor : undefined,
        gradient: colorType === 'gradient' ? baseGrad : undefined
      }
    };
  };

  // --- LIVE RENDERING ---
  const updateQRCode = () => {
    if (qrInstanceRef.current) {
      const config = getQRConfig();
      qrInstanceRef.current.update(config);
      
      // Update mockups
      setTimeout(() => {
        if (qrInstanceRef.current) {
          qrInstanceRef.current.getRawData('png').then((blob: Blob) => {
            setMockupUrl(url => {
              if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
              return URL.createObjectURL(blob);
            });
          }).catch((err: any) => console.error("Mockup render fail", err));
        }
      }, 300);
    }
  };

  // Trigger re-render when config state changes
  useEffect(() => {
    updateQRCode();
  }, [
    activeType, inputUrl, inputText, wifiSsid, wifiPass, wifiEnc,
    vcardFirst, vcardLast, vcardPhone, vcardEmail, vcardOrg, vcardUrl,
    emailTo, emailSubject, emailBody, smsNumber, smsMsg, geoLat, geoLng, phoneNum,
    bodyShape, eyeFrame, eyeBall, colorType, fgColor, fgGrad1, fgGrad2,
    gradAngle, gradType, bgTransparent, bgColor, logoCroppedUrl, logoSize,
    logoClearBg, margin, errorCorrection, resolution, QRCodeStyling
  ]);

  // Append engine to container Ref
  useEffect(() => {
    if (QRCodeStyling && qrContainerRef.current && !qrInstanceRef.current) {
      const instance = new QRCodeStyling(getQRConfig(undefined, 500));
      instance.append(qrContainerRef.current);
      qrInstanceRef.current = instance;
      updateQRCode();
    }
  }, [QRCodeStyling]);

  // --- LOCAL CACHES & PRESET LOADERS ---
  useEffect(() => {
    if (isClient) {
      // Load History
      const hist = localStorage.getItem('qr_studio_history');
      if (hist) setHistoryList(JSON.parse(hist));

      // Load sound & theme settings
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(savedTheme as 'dark' | 'light');
      if (savedTheme === 'light') document.body.classList.add('light-theme');
      else document.body.classList.remove('light-theme');

      const savedSound = localStorage.getItem('sound_enabled');
      if (savedSound === 'false') setSoundEnabled(false);
    }
  }, [isClient]);

  // Toggle Theme
  const toggleTheme = () => {
    playSound('click');
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
    showToast(nextTheme === 'light' ? 'Light Theme Activated' : 'Dark Theme Activated');
  };

  // Toggle Sound
  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    localStorage.setItem('sound_enabled', String(nextSound));
    showToast(nextSound ? 'Sound Effects Enabled' : 'Sound Effects Muted');
  };

  // --- LOGO PROCESSING ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoUrl(base64);
        processLogo(base64, logoCrop);
        playSound('success');
        showToast('Logo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const processLogo = (url: string | null, crop: 'none' | 'circle' | 'square') => {
    if (!url) {
      setLogoCroppedUrl(null);
      return;
    }
    if (crop === 'none') {
      setLogoCroppedUrl(url);
    } else if (crop === 'circle') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, (img.width - size) / -2, (img.height - size) / -2);
          setLogoCroppedUrl(canvas.toDataURL());
        }
      };
      img.src = url;
    } else if (crop === 'square') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.max(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          
          const pad = size * 0.1;
          const drawSize = size - (pad * 2);
          const ratio = Math.min(drawSize / img.width, drawSize / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          setLogoCroppedUrl(canvas.toDataURL());
        }
      };
      img.src = url;
    }
  };

  useEffect(() => {
    if (logoUrl) {
      processLogo(logoUrl, logoCrop);
    }
  }, [logoCrop, logoUrl]);

  const removeLogo = () => {
    playSound('click');
    setLogoUrl(null);
    setLogoCroppedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Logo removed');
  };

  // --- DOWNLOAD & CLIPBOARD COPY ---
  const downloadQR = (format: 'png' | 'svg' | 'jpeg') => {
    if (!QRCodeStyling) return;
    playSound('success');
    
    const dlConfig = getQRConfig(undefined, resolution);
    const exportQr = new QRCodeStyling(dlConfig);
    
    let name = `qr-code-${Date.now()}`;
    if (activeType === 'url') {
      try { name = new URL(inputUrl).hostname.replace('www.', ''); } catch(e) {}
    }
    exportQr.download({ name, extension: format });
    showToast(`Saved as ${format.toUpperCase()}`);
  };

  const copyQRToClipboard = async () => {
    if (!qrInstanceRef.current) return;
    try {
      const blob = await qrInstanceRef.current.getRawData('png');
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      playSound('success');
      showToast('Image copied to clipboard!');
    } catch (e) {
      playSound('error');
      showToast('Copy failed. Try downloading PNG.', 'error');
      console.error(e);
    }
  };

  // --- PRESET PALETTES HANDLER ---
  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      playSound('success');
      setBodyShape(preset.dotsOptions.type);
      setEyeFrame(preset.cornersSquareOptions.type);
      setEyeBall(preset.cornersDotOptions.type);
      setBgTransparent(preset.backgroundOptions.color === 'transparent');
      setBgColor(preset.backgroundOptions.color === 'transparent' ? '#ffffff' : preset.backgroundOptions.color);
      
      if (preset.dotsOptions.gradient) {
        setColorType('gradient');
        const grad = preset.dotsOptions.gradient;
        setFgGrad1(grad.colorStops[0].color);
        setFgGrad2(grad.colorStops[1].color);
        setGradAngle(Math.round(grad.rotation * (180 / Math.PI)) || 0);
        setGradType(grad.type);
      } else {
        setColorType('solid');
        setFgColor(preset.dotsOptions.color);
      }
      showToast('Preset applied!');
    }
  };

  // --- CAMERA AND FILE SCANNERS ---
  const startCamera = () => {
    if (!Html5Qrcode || isScanning) return;
    playSound('click');
    setIsScanning(true);
    
    const scanner = new Html5Qrcode('reader');
    cameraScannerRef.current = scanner;
    
    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (w: number, h: number) => {
          const size = Math.min(w, h) * 0.7;
          return { width: size, height: size };
        }
      },
      (text: string) => {
        playSound('success');
        showToast('QR Code Decoded!');
        setScanResult(text);
        stopCamera();
      },
      () => {}
    ).catch((err: any) => {
      playSound('error');
      console.error(err);
      showToast('Failed to access camera', 'error');
      setIsScanning(false);
      cameraScannerRef.current = null;
    });
  };

  const stopCamera = () => {
    if (cameraScannerRef.current) {
      cameraScannerRef.current.stop().then(() => {
        cameraScannerRef.current.clear();
        cameraScannerRef.current = null;
        setIsScanning(false);
      }).catch((e: any) => {
        console.warn(e);
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (cameraScannerRef.current) {
        cameraScannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const triggerFileScan = () => {
    if (fileScanInputRef.current) {
      stopCamera();
      fileScanInputRef.current.click();
    }
  };

  const handleFileScanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeScanFile(file);
  };

  const decodeScanFile = (file: File) => {
    if (!Html5Qrcode) return;
    const scanner = new Html5Qrcode('reader');
    scanner.scanFile(file, true)
      .then(text => {
        playSound('success');
        showToast('QR Code Decoded!');
        setScanResult(text);
        scanner.clear();
      })
      .catch(err => {
        playSound('error');
        console.error(err);
        setScanResult('Error: Could not decode QR code. Please try a cleaner image.');
        scanner.clear();
      });
  };

  const copyScanResult = () => {
    if (scanResult && scanResult !== 'Waiting for scanned QR code...' && !scanResult.startsWith('Error')) {
      navigator.clipboard.writeText(scanResult);
      playSound('success');
      showToast('Copied to clipboard!');
    }
  };

  // --- BATCH ZIP GENERATION ---
  const runBatchGeneration = async () => {
    if (!QRCodeStyling) return;
    playSound('click');
    const lines = batchText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) {
      playSound('error');
      showToast('Please enter at least one line', 'error');
      return;
    }

    setBatchProgressShow(true);
    setBatchProgressPercent(0);
    setBatchProgressCount(`0/${lines.length}`);
    setBatchProgressStatus('Initializing Batch...');
    
    let logs = `Starting production sequence for ${lines.length} items...\n`;
    setBatchLogs(logs);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < lines.length; i++) {
        const item = lines[i];
        setBatchProgressStatus(`Rendering QR code ${i + 1}...`);
        setBatchProgressCount(`${i + 1}/${lines.length}`);
        setBatchProgressPercent(Math.round(((i + 1) / lines.length) * 100));
        
        logs += `Rendering QR ${i + 1}: ${item.substring(0, 30)}${item.length > 30 ? '...' : ''}\n`;
        setBatchLogs(logs);

        const config = getQRConfig(item, 600);
        const batchQr = new QRCodeStyling(config);
        const blob = await batchQr.getRawData('png');

        let filename = `qr-${i + 1}.png`;
        if (!batchNamingCustom) {
          const cleanName = item.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          filename = `${cleanName || `qr-${i + 1}`}.png`;
        }

        zip.file(filename, blob);
      }

      setBatchProgressStatus('Packaging ZIP file...');
      logs += 'Compiling ZIP archive...\n';
      setBatchLogs(logs);

      const zipContent = await zip.generateAsync({ type: 'blob' });
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
      setBatchProgressStatus('Completed!');
      logs += `\nSuccess! Batch file "${zipName}" downloaded successfully.\n`;
      setBatchLogs(logs);
      showToast('ZIP downloaded!');
    } catch (e: any) {
      playSound('error');
      setBatchProgressStatus('Failed');
      logs += `\nError during batch generation: ${e.message}\n`;
      setBatchLogs(logs);
      showToast('Batch generation failed!', 'error');
    }
  };

  // --- HISTORY & SAVES ---
  const getHistoryTitle = (): string => {
    switch (activeType) {
      case 'url': return inputUrl || 'Link';
      case 'text': return inputText ? inputText.substring(0, 25) + (inputText.length > 25 ? '...' : '') : 'Text Content';
      case 'wifi': return `Wi-Fi: ${wifiSsid}`;
      case 'vcard': return `vCard: ${vcardFirst} ${vcardLast}`;
      case 'email': return `Email: ${emailTo}`;
      case 'sms': return `SMS to ${smsNumber}`;
      case 'geo': return `Geo: ${geoLat}, ${geoLng}`;
      case 'phone': return `Phone: ${phoneNum}`;
      default: return 'QR Design';
    }
  };

  const savePresetToHistory = () => {
    if (!QRCodeStyling) return;
    playSound('success');
    
    // Render 120px thumb
    const thumbConfig = {
      ...getQRConfig(),
      width: 120,
      height: 120,
      margin: 4
    };
    if (thumbConfig.imageOptions) thumbConfig.imageOptions.imageSize = 0.12;

    const thumbQr = new QRCodeStyling(thumbConfig);
    thumbQr.getRawData('png').then((blob: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        const thumbBase64 = reader.result as string;
        
        const historyItem = {
          id: Date.now(),
          title: getHistoryTitle(),
          desc: compileQRCodeData(),
          type: activeType,
          date: new Date().toLocaleDateString(),
          config: JSON.parse(JSON.stringify(getQRConfig())),
          thumb: thumbBase64
        };

        const currentHistory = JSON.parse(localStorage.getItem('qr_studio_history') || '[]');
        currentHistory.unshift(historyItem);
        if (currentHistory.length > 30) currentHistory.pop();

        localStorage.setItem('qr_studio_history', JSON.stringify(currentHistory));
        setHistoryList(currentHistory);
        showToast('Template saved to History!');
      };
      reader.readAsDataURL(blob);
    });
  };

  const loadPresetFromHistory = (item: any) => {
    playSound('success');
    const conf = item.config;
    
    // Load config states back to React states
    setBodyShape(conf.dotsOptions.type);
    setEyeFrame(conf.cornersSquareOptions.type);
    setEyeBall(conf.cornersDotOptions.type);
    setBgTransparent(conf.backgroundOptions.color === 'transparent');
    setBgColor(conf.backgroundOptions.color === 'transparent' ? '#ffffff' : conf.backgroundOptions.color);
    setMargin(conf.margin);
    setErrorCorrection(conf.qrOptions.errorCorrectionLevel);
    setResolution(conf.width);
    
    if (conf.dotsOptions.gradient) {
      setColorType('gradient');
      const grad = conf.dotsOptions.gradient;
      setFgGrad1(grad.colorStops[0].color);
      setFgGrad2(grad.colorStops[1].color);
      setGradAngle(Math.round(grad.rotation * (180 / Math.PI)) || 0);
      setGradType(grad.type);
    } else {
      setColorType('solid');
      setFgColor(conf.dotsOptions.color || '#0f172a');
    }

    if (conf.image) {
      setLogoUrl(conf.image);
      setLogoCroppedUrl(conf.image);
      setLogoSize(conf.imageOptions.imageSize);
      setLogoClearBg(conf.imageOptions.hideBackgroundDots);
    } else {
      setLogoUrl(null);
      setLogoCroppedUrl(null);
    }

    // Load inputs
    setActiveType(item.type);
    restoreInputsFromData(item.type, item.desc);
    setActiveTab('create-tab');
    showToast('Template restored!');
  };

  const restoreInputsFromData = (type: string, desc: string) => {
    try {
      switch (type) {
        case 'url': setInputUrl(desc); break;
        case 'text': setInputText(desc); break;
        case 'phone': setPhoneNum(desc.replace('tel:', '')); break;
        case 'sms':
          const smsP = desc.match(/^SMSTO:([^:]+):(.*)$/s);
          if (smsP) { setSmsNumber(smsP[1]); setSmsMsg(smsP[2]); }
          else setSmsMsg(desc);
          break;
        case 'email':
          const emailUrl = new URL(desc);
          setEmailTo(emailUrl.pathname);
          const params = new URLSearchParams(emailUrl.search);
          setEmailSubject(params.get('subject') || '');
          setEmailBody(params.get('body') || '');
          break;
        case 'wifi':
          const ssidM = desc.match(/S:((?:[^;]|\\;)+);/);
          const passM = desc.match(/P:((?:[^;]|\\;)+);/);
          const encM = desc.match(/T:((?:[^;]|\\;)+);/);
          const un = (v: string) => v.replace(/\\\\/g, '\\').replace(/\\;/g, ';').replace(/\\:/g, ':').replace(/\\,/g, ',');
          if (ssidM) setWifiSsid(un(ssidM[1]));
          if (passM) setWifiPass(un(passM[1]));
          if (encM) setWifiEnc(encM[1]);
          break;
        case 'geo':
          const geoM = desc.replace('geo:', '').split(',');
          if (geoM.length >= 2) { setGeoLat(geoM[0]); setGeoLng(geoM[1]); }
          break;
        case 'vcard':
          const lines = desc.split('\n');
          lines.forEach(line => {
            if (line.startsWith('N:')) {
              const parts = line.replace('N:', '').split(';');
              setVcardLast(parts[0] || '');
              setVcardFirst(parts[1] || '');
            }
            if (line.startsWith('TEL;')) setVcardPhone(line.split(':')[1] || '');
            if (line.startsWith('EMAIL;')) setVcardEmail(line.split(':')[1] || '');
            if (line.startsWith('ORG:')) setVcardOrg(line.replace('ORG:', ''));
            if (line.startsWith('URL:')) setVcardUrl(line.replace('URL:', ''));
          });
          break;
      }
    } catch(e) {
      console.warn("Restore fields fail", e);
    }
  };

  const deleteHistoryItem = (id: number) => {
    playSound('click');
    const filtered = historyList.filter(item => item.id !== id);
    localStorage.setItem('qr_studio_history', JSON.stringify(filtered));
    setHistoryList(filtered);
    showToast('Template deleted');
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your saved templates?')) {
      playSound('click');
      localStorage.removeItem('qr_studio_history');
      setHistoryList([]);
      showToast('History cleared');
    }
  };

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080a14] text-white">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* TOAST ALERTS */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type} ${toast.fade ? 'fade-out' : ''}`}>
            {toast.type === 'success' ? <CheckCircle2 /> : <AlertTriangle />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header>
        <div className="logo-container">
          <div className="logo-icon">QR</div>
          <div className="logo-text">
            QR STUDIO
            <span className="logo-subtitle">NextJS Permanent & Custom</span>
          </div>
        </div>
        <div className="nav-actions">
          <button className="sound-toggle-btn" onClick={toggleSound} title="Toggle Sounds">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <MoonStar size={20} />}
          </button>
        </div>
      </header>

      {/* TABS BAR */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'create-tab' ? 'active' : ''}`}
          onClick={() => { playSound('click'); stopCamera(); setActiveTab('create-tab'); }}
        >
          <QrCode size={16} /> Create Studio
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scan-tab' ? 'active' : ''}`}
          onClick={() => { playSound('click'); setActiveTab('scan-tab'); }}
        >
          <ScanLine size={16} /> Scanner
        </button>
        <button 
          className={`tab-btn ${activeTab === 'batch-tab' ? 'active' : ''}`}
          onClick={() => { playSound('click'); stopCamera(); setActiveTab('batch-tab'); }}
        >
          <Layers size={16} /> Batch Generator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history-tab' ? 'active' : ''}`}
          onClick={() => { playSound('click'); stopCamera(); setActiveTab('history-tab'); }}
        >
          <History size={16} /> History
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="app-container">

        {/* ======================= TAB 1: CREATE ======================= */}
        <div className={`tab-pane ${activeTab === 'create-tab' ? 'active' : ''}`}>
          <div className="studio-grid">
            
            {/* LEFT CUSTOMIZER PANELS */}
            <div className="glass-card">
              
              {/* SELECT DATA TYPE */}
              <div className="panel-section">
                <h3 className="panel-title"><LinkIcon size={18} /> Select Data Type</h3>
                <div className="type-selector-grid">
                  <button className={`type-btn ${activeType === 'url' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('url'); }}>
                    <LinkIcon /> URL / Link
                  </button>
                  <button className={`type-btn ${activeType === 'text' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('text'); }}>
                    <AlignLeft /> Text
                  </button>
                  <button className={`type-btn ${activeType === 'wifi' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('wifi'); }}>
                    <Wifi /> Wi-Fi
                  </button>
                  <button className={`type-btn ${activeType === 'vcard' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('vcard'); }}>
                    <Contact /> Contact
                  </button>
                  <button className={`type-btn ${activeType === 'email' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('email'); }}>
                    <Mail /> Email
                  </button>
                  <button className={`type-btn ${activeType === 'sms' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('sms'); }}>
                    <MessageSquareText /> SMS
                  </button>
                  <button className={`type-btn ${activeType === 'geo' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('geo'); }}>
                    <MapPin /> Location
                  </button>
                  <button className={`type-btn ${activeType === 'phone' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveType('phone'); }}>
                    <Phone /> Phone
                  </button>
                </div>

                {/* FORM FIELDS */}
                <div className="content-forms">
                  
                  {/* URL */}
                  <div className={`type-form ${activeType === 'url' ? 'active' : ''}`}>
                    <div className="form-group">
                      <label>Website URL (Static & Permanent)</label>
                      <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="https://example.com" />
                    </div>
                  </div>

                  {/* TEXT */}
                  <div className={`type-form ${activeType === 'text' ? 'active' : ''}`}>
                    <div className="form-group">
                      <label>Text Content</label>
                      <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type or paste plain text here..." />
                    </div>
                  </div>

                  {/* WIFI */}
                  <div className={`type-form ${activeType === 'wifi' ? 'active' : ''}`}>
                    <div className="form-group">
                      <label>Network Name (SSID)</label>
                      <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="HomeNetwork" />
                    </div>
                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="••••••••" />
                      </div>
                      <div className="form-group">
                        <label>Security Type</label>
                        <select value={wifiEnc} onChange={(e) => setWifiEnc(e.target.value)}>
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">Unsecured (Open)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* vCARD */}
                  <div className={`type-form ${activeType === 'vcard' ? 'active' : ''}`}>
                    <div className="form-group-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" value={vcardFirst} onChange={(e) => setVcardFirst(e.target.value)} placeholder="John" />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" value={vcardLast} onChange={(e) => setVcardLast(e.target.value)} placeholder="Doe" />
                      </div>
                    </div>
                    <div class="form-group-row">
                      <div className="form-group">
                        <label>Mobile Phone</label>
                        <input type="tel" value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} placeholder="+1 555-0199" />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="text" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} placeholder="john.doe@example.com" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Company / Organization</label>
                      <input type="text" value={vcardOrg} onChange={(e) => setVcardOrg(e.target.value)} placeholder="Acme Corp" />
                    </div>
                    <div className="form-group">
                      <label>Website</label>
                      <input type="url" value={vcardUrl} onChange={(e) => setVcardUrl(e.target.value)} placeholder="https://acme.org" />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className={`type-form ${activeType === 'email' ? 'active' : ''}`}>
                    <div className="form-group">
                      <label>Recipient Email</label>
                      <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="hello@company.com" />
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Inquiry about services" />
                    </div>
                    <div className="form-group">
                      <label>Email Message</label>
                      <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Write message..." />
                    </div>
                  </div>

                  {/* SMS */}
                  <div className={`type-form ${activeType === 'sms' ? 'active' : ''}`}>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} placeholder="+1 555-0100" />
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea value={smsMsg} onChange={(e) => setSmsMsg(e.target.value)} placeholder="Write message..." />
                    </div>
                  </div>

                  {/* GEOLOCATION */}
                  <div className={`type-form ${activeType === 'geo' ? 'active' : ''}`}>
                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Latitude</label>
                        <input type="number" step="any" value={geoLat} onChange={(e) => setGeoLat(e.target.value)} placeholder="37.7749" />
                      </div>
                      <div className="form-group">
                        <label>Longitude</label>
                        <input type="number" step="any" value={geoLng} onChange={(e) => setGeoLng(e.target.value)} placeholder="-122.4194" />
                      </div>
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className={`type-form ${activeType === 'phone' ? 'active' : ''}`}>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} placeholder="+1 555-0100" />
                    </div>
                  </div>

                </div>
              </div>

              {/* DESIGN & STYLE CUSTOMIZER */}
              <div className="panel-section">
                <h3 className="panel-title"><Palette size={18} /> Design & Style Customizer</h3>
                
                {/* Accordion 1: Body Shape */}
                <div className={`style-accordion-item ${accordionActive === 'body' ? 'active' : ''}`}>
                  <div className="style-accordion-header" onClick={() => { playSound('click'); setAccordionActive(accordionActive === 'body' ? '' : 'body'); }}>
                    Body Shape Pattern
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                  <div className="style-accordion-content">
                    <div className="preset-shape-grid">
                      {['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'].map(shape => (
                        <button key={shape} className={`shape-btn ${bodyShape === shape ? 'active' : ''}`} onClick={() => { playSound('click'); setBodyShape(shape); }}>
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accordion 2: Corner Eyes */}
                <div className={`style-accordion-item ${accordionActive === 'eye' ? 'active' : ''}`}>
                  <div className="style-accordion-header" onClick={() => { playSound('click'); setAccordionActive(accordionActive === 'eye' ? '' : 'eye'); }}>
                    Corner Eye Design
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                  <div className="style-accordion-content">
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label>Outer Eye Frame Shape</label>
                      <div className="preset-shape-grid">
                        {['square', 'dot', 'rounded'].map(shape => (
                          <button key={shape} className={`shape-btn ${eyeFrame === shape ? 'active' : ''}`} onClick={() => { playSound('click'); setEyeFrame(shape); }}>
                            {shape === 'dot' ? 'Circle' : shape}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Inner Eyeball Shape</label>
                      <div className="preset-shape-grid">
                        {['square', 'dot', 'rounded'].map(shape => (
                          <button key={shape} className={`shape-btn ${eyeBall === shape ? 'active' : ''}`} onClick={() => { playSound('click'); setEyeBall(shape); }}>
                            {shape === 'dot' ? 'Circle' : shape}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion 3: Colors */}
                <div className={`style-accordion-item ${accordionActive === 'colors' ? 'active' : ''}`}>
                  <div className="style-accordion-header" onClick={() => { playSound('click'); setAccordionActive(accordionActive === 'colors' ? '' : 'colors'); }}>
                    Foreground & Background Colors
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                  <div className="style-accordion-content color-picker-group">
                    <label>Foreground Color Type</label>
                    <div className="color-type-toggle">
                      <button className={`color-type-btn ${colorType === 'solid' ? 'active' : ''}`} onClick={() => { playSound('click'); setColorType('solid'); }}>Solid Color</button>
                      <button className={`color-type-btn ${colorType === 'gradient' ? 'active' : ''}`} onClick={() => { playSound('click'); setColorType('gradient'); }}>Gradient</button>
                    </div>

                    {/* Solid Foreground */}
                    <div className={`color-sub-panel ${colorType === 'solid' ? 'active' : ''}`}>
                      <div className="picker-row">
                        <div className="color-input-wrapper">
                          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                        </div>
                        <span className="text-color-code">{fgColor.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Gradient Foreground */}
                    <div className={`color-sub-panel ${colorType === 'gradient' ? 'active' : ''}`}>
                      <div className="form-group-row" style={{ marginBottom: '0.75rem' }}>
                        <div className="form-group">
                          <label>Color Stop 1</label>
                          <div className="picker-row">
                            <div className="color-input-wrapper">
                              <input type="color" value={fgGrad1} onChange={(e) => setFgGrad1(e.target.value)} />
                            </div>
                            <span className="text-color-code">{fgGrad1.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Color Stop 2</label>
                          <div className="picker-row">
                            <div className="color-input-wrapper">
                              <input type="color" value={fgGrad2} onChange={(e) => setFgGrad2(e.target.value)} />
                            </div>
                            <span className="text-color-code">{fgGrad2.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Angle (deg)</label>
                          <input type="number" value={gradAngle} onChange={(e) => setGradAngle(parseInt(e.target.value) || 0)} min="0" max="360" />
                        </div>
                        <div className="form-group">
                          <label>Gradient Shape</label>
                          <select value={gradType} onChange={(e: any) => setGradType(e.target.value)}>
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.75rem 0' }} />

                    {/* Background Color */}
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label>Background Color</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 'normal', cursor: 'pointer' }}>
                          <input type="checkbox" checked={bgTransparent} onChange={(e) => { playSound('click'); setBgTransparent(e.target.checked); }} style={{ cursor: 'pointer' }} /> Transparent
                        </label>
                      </div>
                      <div className="picker-row" style={{ opacity: bgTransparent ? 0.4 : 1, pointerEvents: bgTransparent ? 'none' : 'all' }}>
                        <div className="color-input-wrapper">
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                        </div>
                        <span className="text-color-code">{bgColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion 4: Logo Upload */}
                <div className={`style-accordion-item ${accordionActive === 'logo' ? 'active' : ''}`}>
                  <div className="style-accordion-header" onClick={() => { playSound('click'); setAccordionActive(accordionActive === 'logo' ? '' : 'logo'); }}>
                    Logo / Brand Embedding
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                  <div className="style-accordion-content">
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label>Upload Logo Image (PNG, JPG, SVG)</label>
                      <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" style={{ padding: '0.5rem' }} />
                    </div>
                    
                    {logoUrl && (
                      <div id="logo-controls">
                        <div className="form-group-row" style={{ marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label>Logo Size Scale</label>
                            <input type="range" min="0.05" max="0.3" step="0.01" value={logoSize} onChange={(e) => setLogoSize(parseFloat(e.target.value))} />
                          </div>
                          <div className="form-group">
                            <label>Logo Cropping</label>
                            <select value={logoCrop} onChange={(e: any) => setLogoCrop(e.target.value)}>
                              <option value="none">Original Shape</option>
                              <option value="circle">Circular Clip</option>
                              <option value="square">Square Frame</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={logoClearBg} onChange={(e) => setLogoClearBg(e.target.checked)} style={{ cursor: 'pointer' }} /> Clear QR pixels behind logo
                          </label>
                        </div>
                        <button className="btn-secondary" onClick={removeLogo} style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem' }}>
                          <Trash2 size={16} /> Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Accordion 5: Style Templates */}
                <div className={`style-accordion-item ${accordionActive === 'presets' ? 'active' : ''}`}>
                  <div className="style-accordion-header" onClick={() => { playSound('click'); setAccordionActive(accordionActive === 'presets' ? '' : 'presets'); }}>
                    One-Click Quick Presets
                    <ChevronDown className="chevron-icon" size={16} />
                  </div>
                  <div className="style-accordion-content">
                    <div className="preset-palette-row">
                      <button className="preset-card-btn" onClick={() => applyPreset('classic-dark')}>
                        <div className="preset-preview-circles">
                          <div className="preset-circle" style={{ background: '#0f172a' }}></div>
                          <div className="preset-circle" style={{ background: '#ffffff' }}></div>
                        </div>
                        <span className="preset-card-title">Classic Dark</span>
                      </button>
                      
                      <button className="preset-card-btn" onClick={() => applyPreset('neon-sunset')}>
                        <div className="preset-preview-circles">
                          <div className="preset-circle" style={{ background: '#ff007f' }}></div>
                          <div className="preset-circle" style={{ background: '#7928ca' }}></div>
                        </div>
                        <span className="preset-card-title">Neon Sunset</span>
                      </button>

                      <button className="preset-card-btn" onClick={() => applyPreset('ocean-breeze')}>
                        <div className="preset-preview-circles">
                          <div className="preset-circle" style={{ background: '#0070f3' }}></div>
                          <div className="preset-circle" style={{ background: '#00dfd8' }}></div>
                        </div>
                        <span className="preset-card-title">Ocean Breeze</span>
                      </button>

                      <button className="preset-card-btn" onClick={() => applyPreset('gold-luxury')}>
                        <div className="preset-preview-circles">
                          <div className="preset-circle" style={{ background: '#d4af37' }}></div>
                          <div className="preset-circle" style={{ background: '#0f1322' }}></div>
                        </div>
                        <span className="preset-card-title">Gold Luxury</span>
                      </button>

                      <button className="preset-card-btn" onClick={() => applyPreset('emerald-mint')}>
                        <div className="preset-preview-circles">
                          <div className="preset-circle" style={{ background: '#10b981' }}></div>
                          <div className="preset-circle" style={{ background: '#059669' }}></div>
                        </div>
                        <span className="preset-card-title">Emerald Mint</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* ADVANCED PARAMETERS */}
              <div className="panel-section">
                <h3 className="panel-title"><Settings size={18} /> Advanced Options</h3>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Border Margin Size</label>
                    <input type="number" min="0" max="40" value={margin} onChange={(e) => setMargin(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label>Error Correction Level</label>
                    <select value={errorCorrection} onChange={(e: any) => setErrorCorrection(e.target.value)}>
                      <option value="L">L (Low ~7%)</option>
                      <option value="M">M (Medium ~15%)</option>
                      <option value="Q">Q (Quartile ~25%)</option>
                      <option value="H">H (High ~30% - Best with logo)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT PREVIEW & STICKY MOCKUPS */}
            <div className="preview-sticky">
              
              {/* LIVE QR VIEW */}
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 className="panel-title"><Eye size={18} /> Live QR Preview</h3>
                <div className="qr-preview-wrapper">
                  <div ref={qrContainerRef} id="qr-canvas-holder" className="qr-canvas-container"></div>
                  
                  {/* Rendering Spinner */}
                  <div className="qr-loading" id="qr-spinner">
                    <div className="spinner"></div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>Rendering...</span>
                  </div>
                </div>

                {/* Resolution Slider */}
                <div className="range-slider-group">
                  <div className="slider-labels">
                    <span>Export Quality</span>
                    <span>{resolution} px</span>
                  </div>
                  <input type="range" min="200" max="2000" step="50" value={resolution} onChange={(e) => setResolution(parseInt(e.target.value) || 500)} />
                </div>

                {/* Download Actions */}
                <div className="download-actions-grid">
                  <button className="btn-primary" onClick={() => downloadQR('png')}>
                    <Download size={16} /> Download PNG
                  </button>
                  <button className="btn-secondary" onClick={() => downloadQR('svg')}>
                    <FileCode size={16} /> Save Vector SVG
                  </button>
                  <button className="btn-secondary" onClick={() => downloadQR('jpeg')}>
                    <ImageIcon size={16} /> Save JPEG
                  </button>
                  <button className="btn-secondary" onClick={savePresetToHistory}>
                    <Save size={16} /> Save Template
                  </button>
                  <button className="btn-secondary btn-copy" onClick={copyQRToClipboard}>
                    <Copy size={16} /> Copy QR Image to Clipboard
                  </button>
                </div>
              </div>

              {/* MOCKUP SHOWCASE */}
              <div className="glass-card">
                <div className="mockup-header-row">
                  <h3 className="panel-title" style={{ marginBottom: 0 }}><Shirt size={18} /> Real-World Mockup Preview</h3>
                  
                  <div className="mockup-selector-carousel">
                    {['phone', 'card', 'mug', 'tshirt', 'flyer'].map(mock => (
                      <button key={mock} className={`mockup-tab-btn ${activeMockup === mock ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveMockup(mock as any); }}>
                        {mock.charAt(0).toUpperCase() + mock.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mockup-display-area">
                  
                  {/* Phone Mockup */}
                  <div className={`mockup-container ${activeMockup === 'phone' ? 'active' : ''}`}>
                    <div className="mockup-phone">
                      <div className="mockup-phone-notch"></div>
                      <div className="mockup-phone-screen">
                        <div className="mockup-phone-time">10:42</div>
                        <div className="mockup-phone-qr-wrapper">
                          <img src={mockupUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"} alt="QR Preview" />
                        </div>
                        <div className="mockup-phone-prompt">Scan Lockscreen Code</div>
                      </div>
                    </div>
                  </div>

                  {/* Business Card Mockup */}
                  <div className={`mockup-container ${activeMockup === 'card' ? 'active' : ''}`}>
                    <div className="mockup-card">
                      <div className="mockup-card-info">
                        <div>
                          <div className="mockup-card-name">Alex Morgan</div>
                          <div className="mockup-card-title">Senior Creative Director</div>
                        </div>
                        <div className="mockup-card-contact">
                          m: +1 (555) 0199<br />
                          e: alex@studio.design<br />
                          w: studio.design
                        </div>
                      </div>
                      <div className="mockup-card-qr-wrapper">
                        <img src={mockupUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"} alt="QR Preview" />
                      </div>
                    </div>
                  </div>

                  {/* Mug Mockup */}
                  <div className={`mockup-container ${activeMockup === 'mug' ? 'active' : ''}`}>
                    <div className="mockup-mug-scene">
                      <div className="mockup-mug">
                        <div className="mockup-mug-handle"></div>
                        <div className="mockup-mug-qr-wrapper">
                          <img src={mockupUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"} alt="QR Preview" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* T-Shirt Mockup */}
                  <div className={`mockup-container ${activeMockup === 'tshirt' ? 'active' : ''}`}>
                    <div className="mockup-tshirt">
                      <div className="mockup-tshirt-qr-wrapper">
                        <img src={mockupUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"} alt="QR Preview" />
                      </div>
                    </div>
                  </div>

                  {/* Flyer Mockup */}
                  <div className={`mockup-container ${activeMockup === 'flyer' ? 'active' : ''}`}>
                    <div className="mockup-flyer">
                      <div className="mockup-flyer-header">Grand Opening</div>
                      <div className="mockup-flyer-qr-wrapper">
                        <img src={mockupUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"} alt="QR Preview" />
                      </div>
                      <div className="mockup-flyer-footer">Scan for 50% discount</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ======================= TAB 2: SCANNER ======================= */}
        <div className={`tab-pane ${activeTab === 'scan-tab' ? 'active' : ''}`}>
          <div className="glass-card scanner-layout">
            
            {/* Viewport controls */}
            <div className="scanner-video-panel">
              <h3 className="panel-title"><ScanLine size={18} /> Active Scan Window</h3>
              <div className="scanner-controls">
                {!isScanning ? (
                  <button className="btn-primary scanner-btn" onClick={startCamera}><Video size={16} /> Start Camera</button>
                ) : (
                  <button className="btn-secondary scanner-btn" onClick={stopCamera} style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}><VideoOff size={16} /> Stop Camera</button>
                )}
                <button className="btn-secondary scanner-btn" onClick={triggerFileScan}><FileUp size={16} /> Upload Image</button>
              </div>

              {/* Hidden files scanner input */}
              <input type="file" ref={fileScanInputRef} onChange={handleFileScanChange} accept="image/*" style={{ display: 'none' }} />

              {/* Camera view screen */}
              <div className="webcam-container" id="camera-scanner-view" style={{ display: isScanning ? 'block' : 'none' }}>
                <div id="reader"></div>
                <div className={`scanner-laser ${isScanning ? 'active' : ''}`}></div>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                className={`file-drop-zone ${dragOver ? 'dragover' : ''}`}
                style={{ display: isScanning ? 'none' : 'flex' }}
                onClick={triggerFileScan}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) decodeScanFile(file);
                }}
              >
                <ImageIcon />
                <p style={{ fontWeight: 600 }}>Drag & drop a QR code image here</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or click to browse local files</p>
              </div>
            </div>

            {/* Decoded results panel */}
            <div className="scan-result-panel">
              <div className="glass-card">
                <h3 className="panel-title"><Terminal size={18} /> Decoded Content</h3>
                
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Scanned Output</label>
                  <div className="result-box">{scanResult}</div>
                </div>

                <div className="download-actions-grid" style={{ marginTop: '1.5rem' }}>
                  <button 
                    className="btn-primary" 
                    onClick={copyScanResult}
                    disabled={!scanResult || scanResult === 'Waiting for scanned QR code...' || scanResult.startsWith('Error')}
                  >
                    <Copy size={16} /> Copy to Clipboard
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => { playSound('success'); window.open(scanResult, '_blank'); }}
                    disabled={!scanResult || (!scanResult.startsWith('http://') && !scanResult.startsWith('https://'))}
                  >
                    <ExternalLink size={16} /> Go to Link
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================= TAB 3: BATCH ======================= */}
        <div className={`tab-pane ${activeTab === 'batch-tab' ? 'active' : ''}`}>
          <div className="glass-card batch-layout">
            
            {/* Input list */}
            <div>
              <h3 className="panel-title"><Layers size={18} /> Bulk QR Generation</h3>
              <div className="form-group">
                <label>Enter List (One item per line)</label>
                <textarea 
                  value={batchText} 
                  onChange={(e) => setBatchText(e.target.value)} 
                  style={{ minHeight: '200px' }}
                  placeholder={"https://google.com\nhttps://youtube.com\nhttps://github.com"}
                />
              </div>

              <div className="form-group" style={{ margin: '1.5rem 0' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  * Note: The generator will create individual QR codes using the styling and logo configurations currently defined in the **Create Studio** tab.
                </p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={batchNamingCustom} onChange={(e) => setBatchNamingCustom(e.target.checked)} style={{ cursor: 'pointer' }} /> Name files sequentially (qr-1, qr-2...) instead of using content string
                </label>
              </div>

              <button className="btn-primary" onClick={runBatchGeneration} style={{ width: '100%', padding: '1rem' }}>
                <PackageOpen size={18} /> Generate and Package ZIP
              </button>
            </div>

            {/* Production Log */}
            <div>
              <h3 className="panel-title"><Terminal size={18} /> Production Progress</h3>
              
              {batchProgressShow && (
                <div className="batch-progress-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{batchProgressStatus}</span>
                    <span>{batchProgressCount}</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-fill" style={{ width: `${batchProgressPercent}%` }}></div>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Output Activity Log</label>
                <div className="result-box" style={{ minHeight: '240px', fontSize: '0.8rem' }}>{batchLogs}</div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================= TAB 4: HISTORY ======================= */}
        <div className={`tab-pane ${activeTab === 'history-tab' ? 'active' : ''}`}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="panel-title" style={{ marginBottom: 0 }}><History size={18} /> Saved Designs & Presets</h3>
              {historyList.length > 0 && (
                <button className="btn-secondary" onClick={clearHistory} style={{ padding: '0.5rem 1rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
                  <Trash2 size={16} /> Clear History
                </button>
              )}
            </div>

            <div className="history-grid">
              {historyList.length === 0 ? (
                <div className="history-empty-state">
                  <Archive size={48} />
                  <p style={{ fontWeight: 600 }}>No templates saved yet</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                    Create designs and click "Save Template" in the Create tab to cache your work here.
                  </p>
                </div>
              ) : (
                historyList.map(item => (
                  <div key={item.id} className="history-card">
                    <div className="history-card-header">
                      <span className="history-card-type">
                        <QrCode size={14} /> {item.type}
                      </span>
                      <span className="history-card-date">{item.date}</span>
                    </div>
                    <div className="history-card-body">
                      <div className="history-card-thumb">
                        <img src={item.thumb} alt="QR Thumbnail" />
                      </div>
                      <div className="history-card-details">
                        <span className="history-card-title">{item.title}</span>
                        <span className="history-card-desc" title={item.desc}>{item.desc}</span>
                      </div>
                    </div>
                    <div className="history-card-actions">
                      <button className="btn-icon-small" onClick={() => loadPresetFromHistory(item)} title="Load into Studio">
                        <QrCode size={16} />
                      </button>
                      <button className="btn-icon-small" onClick={() => {
                        playSound('success');
                        const dl = new QRCodeStyling(item.config);
                        dl.download({ name: `qr-${item.id}`, extension: 'png' });
                      }} title="Download PNG">
                        <Download size={16} />
                      </button>
                      <button className="btn-icon-small btn-delete" onClick={() => deleteHistoryItem(item.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}

// Preset color constants
const PRESETS: Record<string, any> = {
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
