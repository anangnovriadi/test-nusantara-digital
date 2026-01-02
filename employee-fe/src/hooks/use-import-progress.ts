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
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!jobId) {
            console.log('[WebSocket] No jobId, skipping connection');
            setProgress(0);
            setIsCompleted(false);
            return;
        }

        console.log('[WebSocket] Connecting for jobId:', jobId);
        console.log('[WebSocket] Connecting to:', SOCKET_URL);

        // Reset state when new jobId is set
        setProgress(0);
        setIsCompleted(false);

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
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

    return { progress, isCompleted, socket };
};
