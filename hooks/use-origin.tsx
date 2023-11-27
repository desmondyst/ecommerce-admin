/**
 * Hook to safely access window object in NEXT13.
 * In server side rendering, window object does not exists
 *
 * The code you provided defines a custom React hook named useOrigin. This hook is designed to retrieve the origin of the current URL, and it appears to account for cases where it is used in environments where window is not defined (e.g., during server-side rendering in Next.js).
 *
 *
 * Conditional Check and Return: If the component is not yet mounted (!mounted), it returns an empty string. This is to prevent potential issues during server-side rendering where window may not be defined. Once the component is mounted, it returns the calculated origin.
 *
 */

import { useEffect, useState } from "react";

export const useOrigin = () => {
    const [mounted, setMounted] = useState(false);
    const origin =
        typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : "";
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return "";
    }

    return origin;
};
