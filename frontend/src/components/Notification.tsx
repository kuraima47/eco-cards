import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { NotificationProps } from "../types/props";

const typeStyles: Record<NonNullable<NotificationProps["type"]>, string> = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
};

const Notification: React.FC<NotificationProps> = ({
    message,
    type = "info",
    duration = 3000,
    onClose,
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setVisible(false);
        onClose?.();
    };

    if (!visible) return null;

    return (
        <div
            className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg flex items-center gap-3 
            ${typeStyles[type]} transition-opacity duration-300 opacity-100 z-50`}
        >
            <span>{message}</span>
            <button onClick={handleClose} aria-label="Fermer la notification">
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Notification;
