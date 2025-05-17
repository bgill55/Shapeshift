import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Extract filename from URL to display
  const filename = url.split('/').pop() || 'Audio Message';
  
  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  useEffect(() => {
    // Update audio element when mute state changes
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };
  
  return (
    <div className="bg-[#2b2d31] rounded-md overflow-hidden my-2 max-w-md">
      <audio 
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
      
      <div className="p-3">
        <div className="text-sm text-[#dcddde] mb-2 truncate">
          {filename}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#4752c4] transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-[#b5bac1] w-10 text-right flex-shrink-0">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="flex-1 h-1.5 bg-[#4f545c] rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #5865f2 ${(currentTime / (duration || 1)) * 100}%, #4f545c ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
            
            <span className="text-xs text-[#b5bac1] w-10 flex-shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="text-[#b5bac1] hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1.5 bg-[#4f545c] rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #b5bac1 ${volume * 100}%, #4f545c ${volume * 100}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
