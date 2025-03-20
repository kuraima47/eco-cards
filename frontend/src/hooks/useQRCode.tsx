import { useState, useCallback, useRef } from 'react';

interface UseQRCodeOptions {
    initialUrl?: string;
    initialQrColor?: string;
    initialBgColor?: string;
    initialLogo?: string;
}

export function useQRCode({
    initialUrl = '',
    initialQrColor = '#000000',
    initialBgColor = '#FFFFFF',
    initialLogo = undefined
}: UseQRCodeOptions = {}) {
    const [url, setUrl] = useState<string>(initialUrl);
    const [qrColor, setQrColor] = useState<string>(initialQrColor);
    const [bgColor, setBgColor] = useState<string>(initialBgColor);
    const [logo, setLogo] = useState<string | undefined>(initialLogo);
  
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleLogoDelete = useCallback(() => {
        setLogo(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const downloadQRCode = useCallback(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = url;
            link.click();
        }
    }, []);

    return {
        url,
        setUrl,
        qrColor,
        setQrColor,
        bgColor,
        setBgColor,
        logo,
        setLogo,
        fileInputRef,
        handleLogoUpload,
        handleLogoDelete,
        downloadQRCode,
    };
}