import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Upload, Disc, Radio } from 'lucide-react';

export const AudioPlayerApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackName, setTrackName] = useState('Cyber Synthwave Flow - 80s Retrowave');
  const [volume, setVolume] = useState(0.75);
  const [duration, setDuration] = useState(180);
  const [currentTime, setCurrentTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const synthTimerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 初始化合成音频生成器（无需外网依赖，纯 Web Audio API 合成真实 Synthwave 律动）
  const createSynthLoop = (ctx: AudioContext) => {
    const sampleRate = ctx.sampleRate;
    const loopLength = 8; // 8 秒一段循环
    const buffer = ctx.createBuffer(2, sampleRate * loopLength, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const bassFreqs = [55, 65.41, 49, 73.42]; // A1, C2, G1, D2
    const chordFreqs = [220, 261.63, 329.63, 392]; // Am7

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const beat = Math.floor(t * 2) % 4;
      const bass = Math.sin(2 * Math.PI * bassFreqs[beat] * t) * 0.22;
      const sub = Math.sin(2 * Math.PI * (bassFreqs[beat] / 2) * t) * 0.18;
      const pad = Math.sin(2 * Math.PI * chordFreqs[beat] * t) * 0.08 * (1 + Math.sin(t * 3));
      const kick = Math.exp(-(t % 0.5) * 20) * Math.sin(2 * Math.PI * 60 * (t % 0.5)) * 0.35;
      const hihat = (Math.random() * 2 - 1) * Math.exp(-((t + 0.25) % 0.5) * 40) * 0.08;

      const mix = bass + sub + pad + kick + hihat;
      left[i] = mix;
      right[i] = mix;
    }
    return buffer;
  };

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const gain = ctx.createGain();
      gain.gain.value = volume;

      gain.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      gainNodeRef.current = gain;

      audioBufferRef.current = createSynthLoop(ctx);
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    const ctx = audioContextRef.current;
    if (!ctx || !gainNodeRef.current) return;

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (_) {}
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNodeRef.current);
    source.start(0);
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const togglePlay = () => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
    } else {
      if (audioBufferRef.current) {
        playBuffer(audioBufferRef.current);
      }
    }
  };

  // 频谱 Canvas 实时绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const analyser = analyserRef.current;
      if (!analyser || !isPlaying) {
        // 静止底线
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 1.6;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.85)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth + 1;
      }
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // 进度时间模拟
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  // 音量调整
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVol;
    }
  };

  // 本地音频文件拖入播放
  const handleFileDrop = (file: File) => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) return;
      try {
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        audioBufferRef.current = decoded;
        setTrackName(file.name.replace(/\.[^/.]+$/, ''));
        setDuration(Math.floor(decoded.duration));
        setCurrentTime(0);
        playBuffer(decoded);
      } catch (err) {
        alert('无法解析该音频格式，请尝试标准的 MP3 或 WAV 文件。');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileDrop(file);
      }}
      className="flex flex-col h-full bg-[#0a0a0d] p-3.5 sm:p-5 justify-between select-none relative overflow-hidden"
    >
      {/* 顶部曲目信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin text-emerald-400' : 'text-zinc-500'}`} />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100 flex items-center space-x-1.5">
              <span>{trackName}</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5 flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-emerald-400">
                <Radio className="w-3 h-3" />
                <span>24-bit 48kHz WebAudio Synthesizer</span>
              </span>
            </div>
          </div>
        </div>

        <label className="cursor-pointer px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5">
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">导入音频</span>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileDrop(file);
            }}
          />
        </label>
      </div>

      {/* 实时柱状音频频谱 Canvas */}
      <div className="my-auto py-2">
        <canvas ref={canvasRef} width={500} height={120} className="w-full h-28 block rounded-lg" />
        <div className="text-center text-[10px] text-zinc-500 mt-1 font-mono">
          拖拽本地 MP3/WAV 文件进入窗口即可即拖即播
        </div>
      </div>

      {/* 底部播放进度条与控制台 */}
      <div className="space-y-3 pt-2 border-t border-zinc-900">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 mx-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center transition-transform active:scale-95 shadow-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <span className="text-xs text-zinc-300 font-medium">
              {isPlaying ? '正在合成输出...' : '点击播放体验'}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-zinc-400">
            <Volume2 className="w-4 h-4" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-emerald-400 cursor-pointer h-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
