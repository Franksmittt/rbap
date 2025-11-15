/**
 * Sound notification utilities
 * Plays alert sounds when notifications appear
 */

let audioContext: AudioContext | null = null;

/**
 * Initialize audio context (required for browser audio)
 */
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a screaming/alert sound using Web Audio API
 * Creates a harsh, attention-grabbing sound
 */
export function playAlertSound() {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    // Create a harsh, attention-grabbing sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const oscillator2 = ctx.createOscillator();

    // Connect nodes
    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // First oscillator - high frequency, harsh
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    // Second oscillator - lower frequency for depth
    oscillator2.type = 'square';
    oscillator2.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);

    // Gain envelope - sharp attack, quick decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    // Play the sound
    oscillator.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
    oscillator2.stop(ctx.currentTime + 0.3);

    // Play a second burst for more attention
    setTimeout(() => {
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);

      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(1000, ctx.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.15);

      gain3.gain.setValueAtTime(0, ctx.currentTime);
      gain3.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc3.start(ctx.currentTime);
      osc3.stop(ctx.currentTime + 0.25);
    }, 200);
  } catch (error) {
    console.error('Error playing alert sound:', error);
  }
}

/**
 * Play a softer notification sound (for less urgent alerts)
 */
export function playSoftNotification() {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

