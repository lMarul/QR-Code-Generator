import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Link,
  User,
  FileText,
  Mail,
  MessageSquare,
  Wifi,
  Bitcoin,
  Twitter,
  Facebook,
  File,
  Music,
  Smartphone,
  Palette,
  Circle,
  Square,
  CornerDownLeft,
  Image,
  Download,
  Settings,
  Sparkles
} from 'lucide-react';
import './App.css';

const contentTypes = [
  { id: 'url', name: 'URL', icon: Link, placeholder: 'https://example.com' },
  { id: 'vcard', name: 'VCARD', icon: User, placeholder: 'BEGIN:VCARD\nFN:John Doe\nTEL:+1234567890\nEND:VCARD' },
  { id: 'text', name: 'TEXT', icon: FileText, placeholder: 'Enter your text here...' },
  { id: 'email', name: 'E-MAIL', icon: Mail, placeholder: 'recipient@example.com?subject=Hello&body=Message' },
  { id: 'sms', name: 'SMS', icon: MessageSquare, placeholder: '+1234567890:Your message here' },
  { id: 'wifi', name: 'WIFI', icon: Wifi, placeholder: 'WIFI:S:NetworkName;T:WPA;P:Password;;' },
  { id: 'bitcoin', name: 'BITCOIN', icon: Bitcoin, placeholder: 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001' },
  { id: 'twitter', name: 'TWITTER', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { id: 'facebook', name: 'FACEBOOK', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { id: 'pdf', name: 'PDF', icon: File, placeholder: 'https://example.com/document.pdf' },
  { id: 'mp3', name: 'MP3', icon: Music, placeholder: 'https://example.com/song.mp3' },
  { id: 'appstores', name: 'APP STORES', icon: Smartphone, placeholder: 'https://apps.apple.com/app/id123456789' }
];

const colorPresets = [
  { name: 'Classic', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Inverted', fg: '#FFFFFF', bg: '#000000' },
  { name: 'Modern', fg: '#1F2937', bg: '#F9FAFB' },
  { name: 'Red', fg: '#DC2626', bg: '#FFFFFF' },
  { name: 'Blue', fg: '#2563EB', bg: '#FFFFFF' },
  { name: 'Green', fg: '#059669', bg: '#FFFFFF' },
  { name: 'Purple', fg: '#7C3AED', bg: '#FFFFFF' },
  { name: 'Orange', fg: '#EA580C', bg: '#FFFFFF' }
];

const shapeOptions = [
  { id: 'square', name: 'Square', icon: Square },
  { id: 'circle', name: 'Circle', icon: Circle },
  { id: 'rounded', name: 'Rounded', icon: CornerDownLeft }
];

const frameStyles = [
  { id: 'none', name: 'None' },
  { id: 'border', name: 'Simple Border' },
  { id: 'rounded', name: 'Rounded Frame' },
  { id: 'shadow', name: 'Shadow Frame' },
  { id: 'gradient', name: 'Gradient Frame' }
];

function App() {
  const [contentType, setContentType] = useState('url');
  const [content, setContent] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [shape, setShape] = useState('square');
  const [frameStyle, setFrameStyle] = useState('none');
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(20);
  const [activeTab, setActiveTab] = useState('colors');
  const [finalQrCode, setFinalQrCode] = useState('');
  const canvasRef = useRef(null);

  // Add roundRect polyfill for older browsers
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && !ctx.roundRect) {
        ctx.roundRect = function(x, y, width, height, radius) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }
    }
  }, []);

  // Generate QR code when content or colors change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content.trim()) {
        generateQRCode();
      } else {
        setQrCodeDataUrl('');
        setFinalQrCode('');
      }
    }, 100); // 100ms debounce - faster response

    return () => clearTimeout(timeoutId);
  }, [content, foregroundColor, backgroundColor]);

  // Generate final QR code with logo and frame when any setting changes
  useEffect(() => {
    if (qrCodeDataUrl) {
      // If we have basic settings (no frame, no logo, square shape), show QR immediately
      if (frameStyle === 'none' && !logo && shape === 'square') {
        setFinalQrCode(qrCodeDataUrl);
      } else {
        generateFinalQRCode();
      }
    }
  }, [qrCodeDataUrl, shape, frameStyle, logo, logoSize]);

  const generateQRCode = async () => {
    try {
      if (!content.trim()) {
        setQrCodeDataUrl('');
        setFinalQrCode('');
        return;
      }

      console.log('Generating QR code for:', content); // Debug log

      const options = {
        color: {
          dark: foregroundColor,
          light: backgroundColor
        },
        width: 256,
        margin: 1,
        errorCorrectionLevel: 'M'
      };
      
      const dataUrl = await QRCode.toDataURL(content, options);
      console.log('QR code generated successfully'); // Debug log
      setQrCodeDataUrl(dataUrl);
      setFinalQrCode(dataUrl); // Set the basic QR code immediately
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrCodeDataUrl('');
      setFinalQrCode('');
    }
  };

  const generateFinalQRCode = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas || !qrCodeDataUrl) return;

      console.log('Generating final QR code with effects'); // Debug log

      const ctx = canvas.getContext('2d');
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Draw background based on frame style
      if (frameStyle === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      } else if (frameStyle === 'shadow') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }

      // Draw frame background
      if (frameStyle !== 'none') {
        const framePadding = 20;
        const frameSize = size - framePadding * 2;
        
        if (frameStyle === 'border') {
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(framePadding, framePadding, frameSize, frameSize);
        } else if (frameStyle === 'rounded') {
          ctx.fillStyle = '#f3f4f6';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(framePadding, framePadding, frameSize, frameSize, 15);
          } else {
            ctx.rect(framePadding, framePadding, frameSize, frameSize);
          }
          ctx.fill();
        }
      }

      // Load and draw QR code
      const qrImage = new Image();
      qrImage.onload = () => {
        try {
          const qrSize = frameStyle !== 'none' ? 320 : 360;
          const qrX = (size - qrSize) / 2;
          const qrY = (size - qrSize) / 2;

          // Apply shape clipping
          if (shape === 'circle') {
            ctx.save();
            ctx.beginPath();
            ctx.arc(qrX + qrSize / 2, qrY + qrSize / 2, qrSize / 2, 0, 2 * Math.PI);
            ctx.clip();
          } else if (shape === 'rounded') {
            ctx.save();
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(qrX, qrY, qrSize, qrSize, 20);
            } else {
              ctx.rect(qrX, qrY, qrSize, qrSize);
            }
            ctx.clip();
          }

          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
          ctx.restore();

          // Draw logo if present
          if (logo) {
            const logoImage = new Image();
            logoImage.onload = () => {
              try {
                const logoSizePx = (qrSize * logoSize) / 100;
                const logoX = qrX + (qrSize - logoSizePx) / 2;
                const logoY = qrY + (qrSize - logoSizePx) / 2;

                // Draw white background for logo
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(logoX + logoSizePx / 2, logoY + logoSizePx / 2, logoSizePx / 2 + 5, 0, 2 * Math.PI);
                ctx.fill();

                // Draw logo
                ctx.save();
                ctx.beginPath();
                ctx.arc(logoX + logoSizePx / 2, logoY + logoSizePx / 2, logoSizePx / 2, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(logoImage, logoX, logoY, logoSizePx, logoSizePx);
                ctx.restore();

                console.log('Final QR code with logo generated'); // Debug log
                setFinalQrCode(canvas.toDataURL());
              } catch (error) {
                console.error('Error drawing logo:', error);
                setFinalQrCode(canvas.toDataURL());
              }
            };
            logoImage.onerror = () => {
              console.error('Error loading logo image');
              setFinalQrCode(canvas.toDataURL());
            };
            logoImage.src = logo;
          } else {
            console.log('Final QR code generated'); // Debug log
            setFinalQrCode(canvas.toDataURL());
          }
        } catch (error) {
          console.error('Error processing QR code:', error);
          setFinalQrCode('');
        }
      };
      qrImage.onerror = () => {
        console.error('Error loading QR code image');
        setFinalQrCode('');
      };
      qrImage.src = qrCodeDataUrl;
    } catch (error) {
      console.error('Error in generateFinalQRCode:', error);
      setFinalQrCode('');
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = () => {
    if (!finalQrCode) return;
    
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = finalQrCode;
    link.click();
  };

  const getCurrentPlaceholder = () => {
    const currentType = contentTypes.find(type => type.id === contentType);
    return currentType ? currentType.placeholder : '';
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">QR Code Generator</h1>
          <p className="text-gray-600 mt-1">Create custom QR codes with advanced styling options</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Controls */}
          <div className="w-2/3 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Content Type Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Type</h3>
                <div className="grid grid-cols-6 gap-2">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          contentType === type.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={getCurrentPlaceholder()}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Customization Tabs */}
              <div>
                <div className="flex space-x-1 mb-4">
                  {[
                    { id: 'colors', name: 'Colors', icon: Palette },
                    { id: 'shape', name: 'Shape', icon: Circle },
                    { id: 'frame', name: 'Frame', icon: Square },
                    { id: 'logo', name: 'Logo', icon: Image }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {activeTab === 'colors' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Color Presets</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {colorPresets.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => {
                                setForegroundColor(preset.fg);
                                setBackgroundColor(preset.bg);
                              }}
                              className="p-2 rounded border hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{
                                    background: `linear-gradient(45deg, ${preset.fg} 50%, ${preset.bg} 50%)`
                                  }}
                                />
                                <span className="text-xs">{preset.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Foreground Color
                          </label>
                          <input
                            type="color"
                            value={foregroundColor}
                            onChange={(e) => setForegroundColor(e.target.value)}
                            className="w-full h-10 rounded border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Color
                          </label>
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-full h-10 rounded border border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'shape' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">QR Code Shape</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {shapeOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.id}
                              onClick={() => setShape(option.id)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                shape === option.id
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2" />
                              <span className="text-sm font-medium">{option.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'frame' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Frame Style</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {frameStyles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setFrameStyle(style.id)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              frameStyle === style.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm font-medium">{style.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'logo' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Logo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      {logo && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo Size: {logoSize}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="40"
                            value={logoSize}
                            onChange={(e) => setLogoSize(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/3 bg-gray-50 p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              
              {/* QR Code Display */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                {finalQrCode ? (
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={finalQrCode}
                      alt="QR Code"
                      className="max-w-full h-auto rounded-lg"
                    />
                    <button
                      onClick={downloadQRCode}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Sparkles className="w-12 h-12 mb-2" />
                    <p className="text-sm">Enter content to generate QR code</p>
                  </div>
                )}
              </div>

              {/* Hidden canvas for rendering */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
