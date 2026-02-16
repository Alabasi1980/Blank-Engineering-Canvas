
/**
 * AUDIO ENGINE
 * A lightweight synthesizer for UI sound effects using Web Audio API.
 * No external assets required.
 */

export const AudioEngine = {
    ctx: null as AudioContext | null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play(type: 'click' | 'hover' | 'success' | 'error' | 'toggle') {
        try {
            this.init();
            if (!this.ctx) return;
            
            const ctx = this.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            if (type === 'click') {
                // High-tech blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
                
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                
                osc.start(now);
                osc.stop(now + 0.08);
            } 
            else if (type === 'hover') {
                // Subtle tick
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                
                osc.start(now);
                osc.stop(now + 0.03);
            }
            else if (type === 'success') {
                // Ascending chime
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.1);
                
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                
                osc.start(now);
                osc.stop(now + 0.3);
            }
            else if (type === 'error') {
                // Low buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                
                osc.start(now);
                osc.stop(now + 0.2);
            }
            else if (type === 'toggle') {
                // Switch sound
                osc.type = 'square';
                osc.frequency.setValueAtTime(600, now);
                
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                
                osc.start(now);
                osc.stop(now + 0.05);
            }

        } catch (e) {
            // Audio context failed or blocked
            console.warn("Audio Engine Error", e);
        }
    }
};
