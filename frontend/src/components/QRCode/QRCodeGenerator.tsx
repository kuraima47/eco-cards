import { Link2 } from 'lucide-react';
import { useQRCode } from '../../hooks/useQRCode';
import { QRCodeForm } from './QRCodeForm';
import { QRCodePreview } from './QRCodePreview';
import QRCodeReader from "./QRCodeReader";

export function QRCodeGenerator() {
    const qrCodeProps = useQRCode();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="relative w-full max-w-6xl mx-auto px-4 py-16">
                <BackgroundDecorations />

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <Link2 className="w-10 h-10 text-indigo-600" />
                        <span>Générateur de QR Code</span>
                    </h1>

                    <div className="grid lg:grid-cols-2 gap-12">
                        <QRCodeForm {...qrCodeProps} />
                        <QRCodePreview {...qrCodeProps} />
                        <QRCodeReader/>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BackgroundDecorations() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl"></div>
        </div>
    );
}