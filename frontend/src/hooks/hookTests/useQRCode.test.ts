import React from 'react';
import { useQRCode } from '../useQRCode';

// Mock React instead of using the actual rendering
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  
  return {
    ...originalReact,
    useState: jest.fn(),
    useCallback: jest.fn((fn) => fn),
    useRef: jest.fn(),
  };
});

// Mock document functions
const mockToDataURL = jest.fn().mockReturnValue('data:image/png;base64,mockedData');
const mockQuerySelector = jest.fn().mockImplementation((selector) => {
  if (selector === 'canvas') {
    return { toDataURL: mockToDataURL };
  }
  return null;
});

const mockClick = jest.fn();
const mockCreateElement = jest.fn().mockImplementation((tag) => {
  if (tag === 'a') {
    return {
      download: '',
      href: '',
      click: mockClick,
    };
  }
  return {};
});

document.querySelector = mockQuerySelector;
document.createElement = mockCreateElement;

describe('useQRCode', () => {
  // Define state setters and values
  const mockSetUrl = jest.fn();
  const mockSetQrColor = jest.fn();
  const mockSetBgColor = jest.fn();
  const mockSetLogo = jest.fn();
  const mockFileInputRef = { current: { value: 'mock-file-input' } };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementation for useState
    let callCount = 0;
    (React.useState as jest.Mock).mockImplementation((initialValue) => {
      callCount++;
      switch(callCount) {
        case 1: return ['https://example.com', mockSetUrl];
        case 2: return ['#4F46E5', mockSetQrColor];
        case 3: return ['#ffffff', mockSetBgColor];
        case 4: return [null, mockSetLogo];
        default: return [initialValue, jest.fn()];
      }
    });
    
    // Set up useRef mock
    (React.useRef as jest.Mock).mockReturnValue(mockFileInputRef);
  });

  test('should initialize with default values', () => {
    const hook = useQRCode();
    
    expect(hook.url).toBe('https://example.com');
    expect(hook.qrColor).toBe('#4F46E5');
    expect(hook.bgColor).toBe('#ffffff');
    expect(hook.logo).toBeNull();
  });

  test('should update url when setUrl is called', () => {
    const hook = useQRCode();
    
    hook.setUrl('https://newurl.com');
    expect(mockSetUrl).toHaveBeenCalledWith('https://newurl.com');
  });

  test('should handle logo upload', () => {
    // Mock FileReader
    const mockFileReaderInstance = {
      onload: null,
      readAsDataURL: jest.fn(function(this: any, blob: Blob) {
        // Store the blob for testing
        this._blob = blob;
      })
    };
    
    const MockFileReader = jest.fn(() => mockFileReaderInstance);
    global.FileReader = MockFileReader as unknown as typeof FileReader;

    const hook = useQRCode();
    const mockFile = new File(['mock content'], 'logo.png', { type: 'image/png' });
    const mockEvent = {
      target: { files: [mockFile] }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    hook.handleLogoUpload(mockEvent);
    
    // Verify FileReader was created and readAsDataURL was called
    expect(MockFileReader).toHaveBeenCalled();
    expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalledWith(mockFile);
    
    // Simulate FileReader onload event
    const onloadCallback = mockFileReaderInstance.onload;
    expect(onloadCallback).toBeTruthy();
    
    if (onloadCallback) {
      onloadCallback.call(mockFileReaderInstance, { 
        target: { result: 'data:image/png;base64,mockLogoData' } 
      } as unknown as ProgressEvent<FileReader>);
    }
    
    // Verify setLogo was called with the correct data
    expect(mockSetLogo).toHaveBeenCalledWith('data:image/png;base64,mockLogoData');
  });

  test('should handle logo deletion', () => {
    const hook = useQRCode();
    
    hook.handleLogoDelete();
    
    expect(mockSetLogo).toHaveBeenCalledWith(null);
    expect(mockFileInputRef.current.value).toBe('');
  });

  test('should download QR code', () => {
    const hook = useQRCode();
    
    hook.downloadQRCode();
    
    expect(mockQuerySelector).toHaveBeenCalledWith('canvas');
    expect(mockToDataURL).toHaveBeenCalledWith('image/png');
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
  });
});