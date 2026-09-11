/**
 * Web Audio Ambient Seaside Synthesizer
 * Generates organic, calming ocean wave sounds procedurally
 * Zero external audio assets needed. Completely self-contained.
 */

class ResortSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start() {
    try {
      this.init();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 3);
      this.masterGain.connect(this.ctx.destination);

      // Create 5 seconds of pink noise buffer
      const bufferSize = this.ctx.sampleRate * 5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      // Low-pass filter for sea surge
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      // LFO for periodic wave swell (0.12 Hz = ~8 second wave cycle)
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(260, this.ctx.currentTime); // mod amplitude

      this.lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Connect graph
      this.noiseSource.connect(filter);
      filter.connect(this.masterGain);

      this.noiseSource.start();
      this.lfo.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio start failed or user did not interact yet', e);
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        try {
          this.noiseSource?.stop();
          this.lfo?.stop();
          this.noiseSource?.disconnect();
          this.lfo?.disconnect();
        } catch {
          // ignore
        }
        this.isPlaying = false;
      }, 1300);
    } catch {
      this.isPlaying = false;
    }
  }
}

export const resortAudio = new ResortSoundEngine();
