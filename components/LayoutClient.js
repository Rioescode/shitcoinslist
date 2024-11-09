"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";

export default function LayoutClient({ children }) {
    const pathname = usePathname();

    useEffect(() => {
        // Add any client-side effects here
    }, [pathname]);

    return (
        <>
            <NextTopLoader color="#8B5CF6" />
            <Toaster position="top-center" />
            {children}
        </>
    );
}
