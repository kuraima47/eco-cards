import { useState, useCallback, useRef } from 'react';

export function useQRCode() {
    const [url, setUrl] = useState('https://example.com');
    const [qrColor, setQrColor] = useState('#4F46E5');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [logo, setLogo] = useState<string | null>(null);
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