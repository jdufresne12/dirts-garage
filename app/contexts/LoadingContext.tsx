'use client';

import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    loadingMessage: string;
    showLoading: (message?: string) => void;
    hideLoading: () => void;
    setLoadingMessage: (message: string) => void;
}

interface LoadingProviderProps {
    children: React.ReactNode;
}
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>("Loading...")

    const showLoading = (message: string = 'Loading...') => {
        setLoadingMessage(message);
        setIsLoading(true);
    }

    const hideLoading = () => {
        setIsLoading(false);
    }

    const updateLoadingMessage = (message: string) => {
        setLoadingMessage(message);
    }

    const value: LoadingContextType = {
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading,
        setLoadingMessage: updateLoadingMessage
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}

