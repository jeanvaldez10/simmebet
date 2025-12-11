import { useEffect, useRef } from 'react';
import type { MusicTrack } from '@/utils/games/blackjack/client/sounds';


interface UseBackgroundMusicOptions {
    track: MusicTrack;
    enabled: boolean;
    volume: number; // 0-100
    loop?: boolean;
}


export function useBackgroundMusic({
    track,
    enabled,
    volume,
    loop = true,
}: UseBackgroundMusicOptions) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const trackRef = useRef<MusicTrack | null>(null);

    // Convert volume from 0-100 to 0-1, then reduce to 40% for background music
    // This makes background music quieter relative to sound effects
    const normalizedVolume = Math.max(0, Math.min(1, (volume / 100) * 0.3));


    // Initialize or update audio element when track changes
    useEffect(() => {
        if (typeof window === 'undefined') return;


        // Clean up previous audio if track changed
        if (audioRef.current && trackRef.current !== track) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current.load();
            audioRef.current = null;
        }


        // Create new audio element if needed
        if (!audioRef.current) {
            const audioPath = `/games/blackjack/assets/sounds/music/${track}.m4a`;
            const audio = new Audio(audioPath);
            audio.loop = loop;
            audio.preload = 'auto';
            audioRef.current = audio;
            trackRef.current = track;
        }


        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current.load();
                audioRef.current = null;
            }
            trackRef.current = null;
        };
    }, [track, loop]);


    // Control playback and volume
    useEffect(() => {
        if (!audioRef.current) return;


        // Update volume
        audioRef.current.volume = normalizedVolume;


        // Control playback
        if (enabled && volume > 0) {
            audioRef.current.play().catch((error) => {
                console.warn(`Failed to play background music: ${track}`, error);
            });
        } else {
            audioRef.current.pause();
        }
    }, [enabled, normalizedVolume, volume, track]);


    return {
        isPlaying: enabled && volume > 0,
        volume: normalizedVolume,
    };
}


