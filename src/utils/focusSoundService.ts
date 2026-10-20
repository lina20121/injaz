// Offline synthesized ambient audio generator using Web Audio API

class FocusSoundService {
  private ctx: AudioContext | null = null;
  private sourceNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;
  private currentSound: 'none' | 'rain' | 'waves' | 'pink_noise' | 'stream' = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(sound: 'rain' | 'waves' | 'pink_noise' | 'stream', volume = 0.5) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentSound = sound;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (sound === 'pink_noise') {
      this.playPinkNoise();
    } else if (sound === 'rain') {
      this.playRainSound();
    } else if (sound === 'waves') {
      this.playOceanWaves();
    } else if (sound === 'stream') {
      this.playStreamSound();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(volume * 0.15, this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.sourceNode) {
      try {
        (this.sourceNode as AudioBufferSourceNode).stop?.();
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }
    this.currentSound = 'none';
  }

  public getCurrentSound() {
    return this.currentSound;
  }

  private playPinkNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(this.gainNode);
    noise.start();
    this.sourceNode = noise;
  }

  private playRainSound() {
    if (!this.ctx || !this.gainNode) return;
    // Filtered pink noise with lowpass filter
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.sourceNode = noise;
  }

  private playOceanWaves() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.gainNode);
    noise.start();
    this.sourceNode = noise;

    // Modulate gain for periodic waves every 4 seconds
    let rising = true;
    let currentWaveGain = 0.2;
    this.intervalId = window.setInterval(() => {
      if (!this.ctx) return;
      if (rising) {
        currentWaveGain += 0.08;
        if (currentWaveGain >= 0.9) rising = false;
      } else {
        currentWaveGain -= 0.08;
        if (currentWaveGain <= 0.15) rising = true;
      }
      waveGain.gain.setTargetAtTime(currentWaveGain, this.ctx.currentTime, 0.4);
    }, 400);
  }

  private playStreamSound() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.sourceNode = noise;
  }
}

export const FocusAudio = new FocusSoundService();
