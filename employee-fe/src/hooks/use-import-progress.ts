import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Remove /api suffix from API_URL for WebSocket connection
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace('/api', '');

console.log('[WebSocket] Socket URL:', SOCKET_URL);

export interface ImportProgress {
    jobId: string;
    progress: number;
}

export const useImportProgress = (jobId: string | null) => {
    const [progress, setProgress] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!jobId) {
            console.log('[WebSocket] No jobId, skipping connection');
            setProgress(0);
            setIsCompleted(false);
            setError(null);
            return;
        }

        console.log('[WebSocket] Connecting for jobId:', jobId);
        console.log('[WebSocket] Connecting to:', SOCKET_URL + '/import');

        // Reset state when new jobId is set
        setProgress(0);
        setIsCompleted(false);
        setError(null);

        // Create socket connection with '/import' namespace
        const newSocket = io(SOCKET_URL + '/import', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('[WebSocket] ✅ Connected successfully');
        });

        newSocket.on('connect_error', (error) => {
            console.error('[WebSocket] ❌ Connection error:', error);
        });

        newSocket.on('importProgress', (data: ImportProgress) => {
            console.log('[WebSocket] 📊 Received progress:', data);
            if (data.jobId === jobId) {
                console.log('[WebSocket] ✅ JobId matches, updating progress to:', data.progress);
                setProgress(data.progress);
                setError(null); // Clear any previous errors
            } else {
                console.log('[WebSocket] ⚠️ JobId mismatch. Expected:', jobId, 'Got:', data.jobId);
            }
        });

        newSocket.on('importCompleted', (data: { jobId: string; totalProcessed: number }) => {
            console.log('[WebSocket] ✅ Received completion:', data);
            if (data.jobId === jobId) {
                console.log('[WebSocket] ✅ Import completed! Total processed:', data.totalProcessed);
                setProgress(100);
                setIsCompleted(true);
                setError(null);
            }
        });

        newSocket.on('importError', (data: { jobId: string; message: string }) => {
            console.log('[WebSocket] ❌ Received error:', data);
            if (data.jobId === jobId) {
                console.log('[WebSocket] ❌ Import error:', data.message);
                setError(data.message);
                setIsCompleted(false);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('[WebSocket] Disconnected');
        });

        setSocket(newSocket);

        return () => {
            console.log('[WebSocket] Cleaning up connection');
            newSocket.close();
        };
    }, [jobId]);

    return { progress, isCompleted, error, socket };
};
