"use client";

import { useState, useEffect } from 'react';
import { usePathname } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";

export default function LayoutClient({ children }) {
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Add any client-side effects here
    }, [pathname]);

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
                <NextTopLoader color="#8B5CF6" />
                <Toaster position="top-center" />
                {children}
            </div>
        </div>
    );
}
