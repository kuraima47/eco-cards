import {QRCodeSVG} from 'qrcode.react';
import { QRCodePreviewProps } from '../../types';

export function QRCodePreview({ url, qrColor, bgColor, logo }: QRCodePreviewProps) {
    return (
        <div className="flex items-center justify-center">
            <div className="relative group">
                <div className="relative bg-white rounded-2xl p-4 ">
                    <QRCodeSVG
                        role="img"
                        value={url}
                        size={100}
                        fgColor={qrColor}
                        bgColor={bgColor}
                        level="Q"
                        imageSettings={
                            logo
                                ? {
                                    src: logo,
                                    width: 25,
                                    height: 25,
                                    excavate: true,
                                }
                                : undefined
                        }
                    />
                </div>
            </div>
        </div>
    );
}