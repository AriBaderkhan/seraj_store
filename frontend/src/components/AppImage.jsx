import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1999';

const AppImage = ({ src, alt, className, style }) => {
    const [imgError, setImgError] = useState(false);

    if (!src) {
        return <div className={`bg-gray-200 flex items-center justify-center text-gray-400 ${className}`} style={style}>No Image</div>;
    }

    // Logic: If it starts with http, use it. Otherwise, prepend API URL.
    const finalSrc = src.startsWith('http') ? src : `${API_BASE_URL}${src}`;

    if (imgError) {
        return <div className={`bg-gray-200 flex items-center justify-center text-gray-500 text-xs ${className}`} style={style}>Img Error</div>;
    }

    return (
        <img
            src={finalSrc}
            alt={alt}
            className={className}
            style={style}
            onError={() => setImgError(true)}
        />
    );
};

export default AppImage;
