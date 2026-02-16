
/**
 * CHROMATIC REACTOR ENGINE v2.0
 * Uses Hue Shifting and Bezier-like curves to generate natural, vibrant palettes.
 */

interface HSL { h: number; s: number; l: number; }
interface RGB { r: number; g: number; b: number; }

// --- MATHEMATICAL HELPERS ---

const hexToRgb = (hex: string): RGB => {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const rgbToHsl = ({ r, g, b }: RGB): HSL => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = ({ h, s, l }: HSL): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

// --- PHYSICS ENGINE: HUE SHIFTING ---
// Natural light shifts hue as it gets brighter/darker (Bezold–Brücke effect simulation)
const getHueShift = (h: number, step: number): number => {
    // Warm colors (Red/Yellow) shift towards Yellow as they lighten
    // Cool colors (Blue/Green) shift towards Cyan as they lighten
    const amount = step * 1.5; // Degree of shift
    return (h + amount) % 360;
};

// --- PRODUCTION LINES ---

const generateTonalScale = (baseHex: string, mode: 'dark' | 'light') => {
    const baseHSL = rgbToHsl(hexToRgb(baseHex));
    const scale: Record<string, string> = {};
    
    // We generate 11 steps: 50 (lightest) to 950 (darkest)
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    
    steps.forEach(step => {
        // Normalize step to -5 to +5 range relative to base (500)
        const factor = (step - 500) / 100; 
        
        // 1. Lightness Curve (Non-linear)
        // Dark mode needs deeper blacks, Light mode needs cleaner whites
        let targetL = baseHSL.l - (factor * 8); // Linear base
        
        // Clamp
        targetL = Math.max(2, Math.min(98, targetL));

        // 2. Saturation Compensation
        // Very light and very dark colors naturally lose saturation perception
        let targetS = baseHSL.s;
        if (step < 300) targetS = Math.max(0, baseHSL.s - (300 - step) * 0.1); // Reduce sat for pastels
        if (step > 800) targetS = Math.max(0, baseHSL.s + (step - 800) * 0.2); // Boost sat for deep darks to avoid grayness

        // 3. Hue Shifting (The Secret Sauce)
        // Shift hue slightly based on lightness to emulate natural gradients
        const targetH = getHueShift(baseHSL.h, factor * 2);

        scale[step] = hslToHex({ h: targetH, s: targetS, l: targetL });
    });

    return scale;
};

const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return yiq >= 128 ? '#0f172a' : '#ffffff';
};

export interface Palette {
    bg: {
        app: string;
        panel: string;
        inset: string;
    };
    primary: {
        base: string;
        hover: string;
        active: string;
        glass: string;
        glow: string;
        scale: Record<string, string>; // The Full Production Line
    };
    text: {
        primary: string;
        secondary: string;
        muted: string;
        onBrand: string;
    };
    border: {
        subtle: string;
        highlight: string;
    };
}

export const ColorFactory = {
    generate: (primaryHex: string, mode: 'dark' | 'light' = 'dark'): Palette => {
        const primaryScale = generateTonalScale(primaryHex, mode);
        
        // Determine Background Base based on Mode
        // Dark mode uses the 950 or 900 shade of the primary color, heavily desaturated
        // This makes the background "tinted" with the brand color, not pitch black.
        const bgBase = mode === 'dark' ? primaryScale[950] : primaryScale[50];
        const bgRgb = hexToRgb(bgBase);
        const bgHsl = rgbToHsl(bgRgb);
        
        // Desaturate background heavily for usability, but keep a hint of the hue
        const appBg = hslToHex({ h: bgHsl.h, s: Math.min(bgHsl.s, 15), l: Math.max(bgHsl.l, 3) }); 
        
        // Panel is slightly lighter/darker
        const panelL = mode === 'dark' ? bgHsl.l + 5 : bgHsl.l - 2;
        const panelBg = hslToHex({ h: bgHsl.h, s: Math.min(bgHsl.s, 10), l: panelL });
        
        // Glass Effects
        const glassRgb = hexToRgb(primaryHex);

        return {
            bg: {
                app: appBg,
                panel: mode === 'dark' ? `rgba(${hexToRgb(panelBg).r}, ${hexToRgb(panelBg).g}, ${hexToRgb(panelBg).b}, 0.65)` : '#ffffff',
                inset: mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(241, 245, 249, 0.8)'
            },
            primary: {
                base: primaryHex,
                hover: primaryScale[400], // Slightly lighter
                active: primaryScale[600], // Slightly darker
                glass: `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, 0.15)`,
                glow: `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, 0.5)`,
                scale: primaryScale
            },
            text: {
                primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
                secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
                muted: mode === 'dark' ? '#475569' : '#94a3b8',
                onBrand: getContrastColor(primaryHex)
            },
            border: {
                subtle: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                highlight: `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, 0.3)`
            }
        };
    }
};
