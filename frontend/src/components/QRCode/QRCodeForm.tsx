import React from 'react';
import { Upload, Download } from 'lucide-react';
import { QRCodeFormProps } from '../../types';

export function QRCodeForm({
                               url,
                               setUrl,
                               qrColor,
                               setQrColor,
                               logo,
                               fileInputRef,
                               handleLogoUpload,
                               handleLogoDelete,
                               downloadQRCode,
                           }: QRCodeFormProps) {
    return (
        <div className="space-y-8">
            <URLInput url={url} setUrl={setUrl} />
            <ColorPicker qrColor={qrColor} setQrColor={setQrColor} />
            <LogoUploader
                logo={logo}
                fileInputRef={fileInputRef}
                handleLogoUpload={handleLogoUpload}
                handleLogoDelete={handleLogoDelete}
            />
            <DownloadButton downloadQRCode={downloadQRCode} />
        </div>
    );
}

export function URLInput({ url, setUrl }: { url: string; setUrl: (url: string) => void }) {
    return (
        <div className="group">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL
            </label>
            <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                placeholder="Entrez votre URL"
            />
        </div>
    );
}

export function ColorPicker({
                         qrColor,
                         setQrColor,
                     }: {
    qrColor: string;
    setQrColor: (color: string) => void;
}) {
    return (
        <div>
            {/*<label htmlFor="qrColor" className="block text-sm font-medium text-gray-700 mb-2">*/}
            <label htmlFor="qrColor">
                Couleur du QR Code
            </label>
            <div className="flex items-center">
                <input
                    type="color"
                    id="qrColor"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-16 h-16 rounded-xl cursor-pointer border-0 bg-gray-900"
                />
            </div>
        </div>
    );
}

export function LogoUploader({
                          logo,
                          fileInputRef,
                          handleLogoUpload,
                          handleLogoDelete,
                      }: {
    logo: string | null;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleLogoDelete: () => void;
}) {
    return (
        <div>
            {/*<label className="block text-sm font-medium text-gray-700 mb-2">*/}
            <label>
                Logo (optionnel)
            </label>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors">
                    <Upload className="w-5 h-5" />
                    Choisir un logo
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                    />
                </label>
                {logo && (
                    <button
                        onClick={handleLogoDelete}
                        className="px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        Supprimer
                    </button>
                )}
            </div>
        </div>
    );
}

export function DownloadButton({ downloadQRCode }: { downloadQRCode: () => void }) {
    return (
        <button
            onClick={downloadQRCode}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 group"
        >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Télécharger le QR Code
        </button>
    );
}
