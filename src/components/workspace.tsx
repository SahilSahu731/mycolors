'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ColorInput, CopyButton, download, Icon } from './ui';
import { accessible, contrast, fromHsl, harmony, hex, hsl, initialPalette, ink, mix, normalize, paletteCSS, rgb, toolsList } from '@/lib/colors';
function Swatches({ colors, onChange }: {
    colors: string[];
    onChange?: (c: string) => void;
}) { const [copied, setCopied] = useState(-1); return <div className="workspace-swatches">{colors.map((c, i) => <button key={i} style={{ background: c, color: ink(c) }} onClick={async () => { if (onChange)
    onChange(c);
else {
    try {
        await navigator.clipboard.writeText(c);
        setCopied(i);
        setTimeout(() => setCopied(-1), 1800);
    }
    catch {
        setCopied(-1);
    }
} }} title={`${onChange ? 'Select' : 'Copy'} ${c}`}><span>{copied === i ? 'COPIED!' : c.toUpperCase()}</span></button>)}</div>; }
function Export({ text, name = 'mycolors-colors.css' }: {
    text: string;
    name?: string;
}) { return <div className="export-block"><div className="panel-heading"><h3>Your colors, ready to go.</h3><div className="button-row"><CopyButton text={text}/><button className="button secondary" onClick={() => download(text, name)}>Download ↓</button></div></div><pre>{text}</pre></div>; }
function Theme({ base }: {
    base: string;
}) { const [previewDark, setPreviewDark] = useState(false); const make = (dark: boolean) => { const background = dark ? mix(base, '#111410', .94) : mix(base, '#ffffff', .96); const surface = dark ? mix(base, '#20241e', .9) : '#ffffff'; const primary = accessible(base, background, 3); return { background, surface, foreground: dark ? '#f2f4ed' : '#22281d', muted: accessible(dark ? '#91998a' : '#72796d', background), primary, 'primary-foreground': ink(primary), border: mix(base, dark ? '#33382f' : '#dce1d7', .85) }; }; const css = [false, true].map(d => `${d ? '[data-theme="dark"]' : ':root'} {\n${Object.entries(make(d)).map(([k, v]) => `  --${k}: ${v};`).join('\n')}\n}`).join('\n\n'); const tokens = make(previewDark); return <><div className="panel-heading"><h3>Live interface preview</h3><div className="segmented"><button className={!previewDark ? 'active' : ''} onClick={() => setPreviewDark(false)}>☀ Light</button><button className={previewDark ? 'active' : ''} onClick={() => setPreviewDark(true)}>☾ Dark</button></div></div><div className="theme-preview" style={{ background: tokens.background, color: tokens.foreground, borderColor: tokens.border }}><aside style={{ borderColor: tokens.border }}><b>✳ Studio</b><p>Overview</p><p>Projects</p><p>Collections</p></aside><div className="theme-main"><span style={{ color: tokens.muted }}>YOUR CREATIVE SPACE</span><h2>Make room for good ideas.</h2><p style={{ color: tokens.muted }}>A considered color system brings everything together.</p><div className="theme-sample" style={{ background: tokens.surface, borderColor: tokens.border }}><div><h3>The next chapter</h3><p style={{ color: tokens.muted }}>A fresh start, in your colors.</p></div><button onClick={() => setPreviewDark(!previewDark)} style={{ background: tokens.primary, color: tokens['primary-foreground'] }}>Try {previewDark ? 'light' : 'dark'} mode </button></div><div className="theme-stats">{['Colors in harmony', 'Ready for both modes', 'Built around your brand'].map((s, i) => <div key={s}><b style={{ color: tokens.primary }}>{['07', '02', '01'][i]}</b><p style={{ color: tokens.muted }}>{s}</p></div>)}</div></div></div><div className="token-row">{Object.entries(tokens).map(([name, c]) => <div key={name}><i style={{ background: c }}/><span>{name}<small>{c}</small></span></div>)}</div><p className="hint">Body text: {contrast(tokens.foreground, tokens.background).toFixed(2)}:1 · Button text: {contrast(tokens.primary, tokens['primary-foreground']).toFixed(2)}:1</p><Export text={css}/></>; }
function ContrastTool({ fix = false }: {
    fix?: boolean;
}) { const [fg, setFg] = useState('#898e77'); const [bg, setBg] = useState('#f3f4ed'); const [css, setCss] = useState('.card {\n  color: #898e77;\n  background-color: #f3f4ed;\n}\n\n.button {\n  color: #ffffff;\n  background-color: #a3be88;\n}'); const [audit, setAudit] = useState<{
    selector: string;
    fg: string;
    bg: string;
}[] | null>(null); const ratio = contrast(fg, bg); const fixed = accessible(fg, bg); function analyze() { const found = []; for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const color = match[2].match(/(?:^|;)\s*color\s*:\s*(#[a-f\d]{3,6})\s*(?:;|$)/i);
    const background = match[2].match(/(?:^|;)\s*background(?:-color)?\s*:\s*(#[a-f\d]{3,6})\s*(?:;|$)/i);
    if (color && background) {
        const a = normalize(color[1]), b = normalize(background[1]);
        if (a && b)
            found.push({ selector: match[1].trim(), fg: a, bg: b });
    }
} setAudit(found); } return <>{fix && <section className="panel"><h3>Check explicit CSS color pairs</h3><p className="hint">Paste rules with solid HEX text and background colors in the same block. Inherited colors, variables, images, alpha and rendered layouts need a browser audit.</p><textarea aria-label="CSS to analyze" value={css} onChange={e => { setCss(e.target.value); setAudit(null); }} rows={9}/><button className="button" onClick={analyze}>Analyze CSS <Icon name="fix" size={18}/></button>{audit && <div className="audit-results">{!audit.length ? <p>No supported pairs found. Add color and background-color as HEX values to the same rule.</p> : audit.map((a, i) => <div className="audit-row" key={i}><code>{a.selector}</code><span>{contrast(a.fg, a.bg).toFixed(2)}:1</span><span className={contrast(a.fg, a.bg) >= 4.5 ? 'pass' : 'fail'}>{contrast(a.fg, a.bg) >= 4.5 ? 'Pass AA' : 'Needs a fix'}</span><button className="button secondary" onClick={() => { setFg(a.fg); setBg(a.bg); }}>Inspect pair </button></div>)}</div>}</section>}<div className="two-column"><section className="panel"><h3>Choose your pair</h3><ColorInput label="Text color" value={fg} onChange={setFg}/><ColorInput label="Background color" value={bg} onChange={setBg}/><button className="button secondary" onClick={() => { setFg(bg); setBg(fg); }}>⇄ Swap colors</button></section><div className="contrast-preview" style={{ background: bg, color: fg }}><span>THE QUICK BROWN FOX</span><strong>Aa</strong><h3>Good design speaks clearly.</h3><p>This is how your normal body text will look.</p></div></div><div className="score-panel"><div><span>CONTRAST RATIO</span><strong>{ratio.toFixed(2)}<small>:1</small></strong></div>{[['AA normal text', 4.5], ['AA large text', 3], ['AAA normal text', 7]].map(([s, n]) => <div key={s}><span>{s}</span><b className={ratio >= Number(n) ? 'pass' : 'fail'}>{ratio >= Number(n) ? '✓ Pass' : '× Fail'}</b></div>)}</div>{ratio < 4.5 && <div className="fix-suggestion"><span>Make text readable with <b>{fixed}</b> ({contrast(fixed, bg).toFixed(2)}:1)</span><button className="button" onClick={() => setFg(fixed)}>Apply accessible color </button></div>}<Export text={`.accessible-pair {\n  color: ${fg};\n  background-color: ${bg};\n}`}/></>; }
function Gradient({ palette }: {
    palette: string[];
}) { const [stops, setStops] = useState(palette.slice(0, 3)); const [angle, setAngle] = useState(120); const [type, setType] = useState('linear'); const css = type === 'linear' ? `linear-gradient(${angle}deg, ${stops.join(', ')})` : `radial-gradient(circle, ${stops.join(', ')})`; return <><div className="gradient-preview" style={{ background: css }}><span>Let your ideas flow.</span></div><section className="panel"><div className="panel-heading"><h3>Make it your own</h3><select aria-label="Gradient type" value={type} onChange={e => setType(e.target.value)}><option value="linear">Linear</option><option value="radial">Radial</option></select></div><div className="stop-row">{stops.map((c, i) => <div key={i}><ColorInput label={`Stop ${i + 1}`} value={c} onChange={v => setStops(stops.map((x, j) => j === i ? v : x))}/>{stops.length > 2 && <button className="text-button" onClick={() => setStops(stops.filter((_, j) => i !== j))}>Remove</button>}</div>)}{stops.length < 5 && <button className="button secondary" onClick={() => setStops([...stops, '#f0a7c2'])}>+ Add stop</button>}</div>{type === 'linear' && <label className="range-label">Angle <b>{angle}°</b><input type="range" min="0" max="360" value={angle} onChange={e => setAngle(+e.target.value)}/></label>}</section><Export text={`.gradient {\n  background: ${css};\n}`}/></>; }
function Palette({ palette, setPalette }: {
    palette: string[];
    setPalette: (p: string[]) => void;
}) { const [locked, setLocked] = useState<boolean[]>(Array(5).fill(false)); function generate() { const c = fromHsl(Math.random() * 360, 40 + Math.random() * 40, 60); const next = harmony(c, ['Analogous', 'Triadic', 'Complementary'][Math.floor(Math.random() * 3)]); setPalette(palette.map((v, i) => locked[i] ? v : next[i])); } useEffect(() => { function key(e: KeyboardEvent) { if (e.code === 'Space' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLButtonElement) && !(e.target instanceof HTMLSelectElement)) {
    e.preventDefault();
    generate();
} } window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }); return <><div className="panel-heading"><p className="hint">Press space to explore. Lock the colors you love.</p><button className="button" onClick={generate}>↻ Generate palette</button></div><div className="palette-editor">{palette.map((c, i) => <div key={i}><div className="palette-tall" style={{ background: c, color: ink(c) }}><span>0{i + 1}</span><button aria-label={`${locked[i] ? 'Unlock' : 'Lock'} color ${i + 1}`} onClick={() => setLocked(locked.map((v, j) => j === i ? !v : v))}>{locked[i] ? '● Locked' : '○ Lock'}</button><b>{c.toUpperCase()}</b></div><ColorInput label={`Color ${i + 1}`} value={c} onChange={v => setPalette(palette.map((x, j) => j === i ? v : x))}/></div>)}</div><Export text={paletteCSS(palette)}/><div className="button-row"><button className="button secondary" onClick={() => download(JSON.stringify(palette, null, 2), 'mycolors-palette.json')}>Export JSON ↓</button><Link href="/tools/theme-studio" className="text-button">Build a theme with these colors </Link></div></>; }
function Extractor({ setPalette }: {
    setPalette: (p: string[]) => void;
}) { const [src, setSrc] = useState(''); const [colors, setColors] = useState<string[]>([]); const [error, setError] = useState(''); const [saved, setSaved] = useState(false); const [sample, setSample] = useState(''); const canvas = useRef<HTMLCanvasElement>(null); function load(file?: File) { if (!file)
    return; if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) {
    setError('Choose a JPG, PNG, WebP, GIF or AVIF image.');
    return;
} if (file.size > 20 * 1024 * 1024) {
    setError('Please choose an image smaller than 20 MB.');
    return;
} setError(''); setSaved(false); setSample(''); const reader = new FileReader(); reader.onerror = () => setError('This image could not be read. Please try another file.'); reader.onload = () => { const image = new Image(); image.onerror = () => setError('This image could not be decoded. Please try another file.'); image.onload = () => { const el = canvas.current; if (!el)
    return; const scale = Math.min(1, 700 / image.width, 440 / image.height); el.width = Math.round(image.width * scale); el.height = Math.round(image.height * scale); const ctx = el.getContext('2d', { willReadFrequently: true }); if (!ctx)
    return; ctx.drawImage(image, 0, 0, el.width, el.height); const pixels = ctx.getImageData(0, 0, el.width, el.height).data; const buckets = new Map<string, {
    n: number;
    sum: number[];
}>(); for (let i = 0; i < pixels.length; i += 16) {
    if (pixels[i + 3] < 128)
        continue;
    const v = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const key = v.map(v => Math.floor(v / 32)).join(',');
    const b = buckets.get(key) || { n: 0, sum: [0, 0, 0] };
    b.n++;
    b.sum = b.sum.map((x, j) => x + v[j]);
    buckets.set(key, b);
} const ranked = [...buckets.values()].sort((a, b) => b.n - a.n); const chosen: string[] = []; for (const b of ranked) {
    const c = hex(b.sum.map(v => v / b.n));
    if (chosen.every(x => rgb(x).reduce((s, v, j) => s + (v - rgb(c)[j]) ** 2, 0) > 1800))
        chosen.push(c);
    if (chosen.length === 5)
        break;
} if (!chosen.length) {
    setError('No opaque colors found. Try an image with visible pixels.');
    return;
} setColors(chosen); setSrc(String(reader.result)); }; image.src = String(reader.result); }; reader.readAsDataURL(file); } return <><label className="upload-zone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); load(e.dataTransfer.files[0]); }}><Icon name="image" size={36}/><h2>A whole palette, hiding in your photo.</h2><p>Drop an image here, or click to choose a file.</p><span className="button">Choose an image ↑</span><small>JPG, PNG, WebP, GIF or AVIF · Up to 20 MB · Stays on your device</small><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={e => load(e.target.files?.[0])}/></label>{error && <p role="alert" className="fail">{error}</p>}<div className={src ? 'canvas-wrap' : 'canvas-wrap hidden'}><canvas ref={canvas} aria-label="Uploaded image: click to sample a color" onClick={e => { const el = e.currentTarget; const r = el.getBoundingClientRect(); const data = el.getContext('2d')?.getImageData(Math.min(el.width - 1, Math.floor((e.clientX - r.left) * el.width / r.width)), Math.min(el.height - 1, Math.floor((e.clientY - r.top) * el.height / r.height)), 1, 1).data; if (data)
    setSample(hex([...data].slice(0, 3))); }}/></div>{colors.length > 0 && <><p className="hint">Click the image to sample any pixel. {sample && `Selected: ${sample}`}</p>{sample && <CopyButton text={sample} label={`Copy ${sample}`}/>}<Swatches colors={colors} onChange={setSample}/><button className="button" onClick={() => { setPalette(Array.from({ length: 5 }, (_, i) => colors[i % colors.length])); setSaved(true); }}>{saved ? '✓ Palette saved' : 'Use this palette '}</button>{saved && <p className="pass" role="status">Continue in <Link href="/tools/palette-studio">Palette Studio </Link> or <Link href="/tools/theme-studio">Theme Studio </Link>.</p>}<Export text={paletteCSS(colors)}/></>}</>; }
function Explore({ base, theory = false }: {
    base: string;
    theory?: boolean;
}) { const [mode, setMode] = useState('Analogous'); const colors = harmony(base, mode); const [h, s, l] = hsl(base); return <><div className="two-column"><div className="wheel-panel"><div className="color-wheel" style={{ transform: `rotate(${h}deg)` }}><div style={{ background: base }}/></div></div><section className="panel"><h3>{theory ? 'Color relationships, made tangible.' : 'Meet your color.'}</h3><p>{theory ? 'Move your base color and explore how colors relate on the wheel.' : 'A closer look at the values behind your color.'}</p><dl className="color-values"><dt>HEX</dt><dd>{base.toUpperCase()}</dd><dt>RGB</dt><dd>{rgb(base).join(', ')}</dd><dt>HSL</dt><dd>{Math.round(h)}°, {Math.round(s)}%, {Math.round(l)}%</dd></dl><CopyButton text={`HEX: ${base}\nRGB: ${rgb(base).join(', ')}\nHSL: ${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%`} label="Copy color values"/></section></div><div className="panel-heading"><h3>Find your harmony</h3><select aria-label="Color harmony" value={mode} onChange={e => setMode(e.target.value)}>{['Analogous', 'Complementary', 'Triadic'].map(m => <option key={m}>{m}</option>)}</select></div><p className="hint">{mode === 'Analogous' ? 'Neighboring hues feel connected and calm. Try them for a cohesive, natural palette.' : mode === 'Complementary' ? 'Opposite hues create energy and separation. Use one as the lead and the other as an accent.' : 'Three evenly spaced hues create variety. Give one color more space for a balanced composition.'}</p><Swatches colors={colors}/><h3 className="subheading">Tints & shades</h3><Swatches colors={[.85, .65, .4, 0].map(t => mix(base, '#ffffff', t)).concat([.25, .5, .75].map(t => mix(base, '#000000', t)))}/><Export text={paletteCSS(colors)}/></>; }
function Matcher({ base, setPalette }: {
    base: string;
    setPalette: (p: string[]) => void;
}) { const [mode, setMode] = useState('Analogous'); const [context, setContext] = useState('Branding'); const [saved, setSaved] = useState(false); const colors = harmony(base, mode); return <><div className="panel-heading"><div className="tabs">{['Branding', 'Interiors', 'Outfits'].map(v => <button className={v === context ? 'active' : ''} key={v} onClick={() => setContext(v)}>{v}</button>)}</div><select aria-label="Harmony type" value={mode} onChange={e => setMode(e.target.value)}>{['Analogous', 'Complementary', 'Triadic'].map(v => <option key={v}>{v}</option>)}</select></div><div className="match-preview" style={{ background: colors[0], color: ink(colors[0]) }}><div><span>{context.toUpperCase()} / COLOR STORY</span><h2>{context === 'Branding' ? 'A brand with a point of hue.' : context === 'Interiors' ? 'A space that feels like you.' : 'A well-matched kind of day.'}</h2><p>{context === 'Branding' ? 'Lead with your primary color. Let your accents do the talking.' : context === 'Interiors' ? 'Try 60% base, 30% secondary, and 10% accent.' : 'Start with a base piece, add a supporting color, finish with a small accent.'}</p></div><div className="match-shapes">{colors.slice(1, 4).map(c => <i style={{ background: c }} key={c}/>)}</div></div><Swatches colors={colors}/><button className="button" onClick={() => { setPalette(colors); setSaved(true); }}>{saved ? '✓ Palette saved' : 'Use this palette '}</button><Export text={paletteCSS(colors)}/></>; }
const matrices: Record<string, number[][]> = { Protanopia: [[.152286, 1.052583, -.204868], [.114503, .786281, .099216], [-.003882, -.048116, 1.051998]], Deuteranopia: [[.367322, .860646, -.227968], [.280085, .672501, .047413], [-.01182, .04294, .968881]], Tritanopia: [[1.255528, -.076749, -.178779], [-.078411, .930809, .147602], [.004733, .691367, .3039]] };
function simulate(c: string, mode: string) { const linear = rgb(c).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); if (mode === 'Achromatopsia') {
    const y = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
    return hex(Array(3).fill(255 * (y <= .0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - .055)));
} return hex(matrices[mode].map(row => row.reduce((sum, v, i) => sum + v * linear[i], 0)).map(v => Math.max(0, Math.min(1, v))).map(v => 255 * (v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055))); }
function Vision({ palette }: {
    palette: string[];
}) { const [mode, setMode] = useState('Deuteranopia'); return <><div className="panel-heading"><h3>Different perspectives. Better design.</h3><select value={mode} onChange={e => setMode(e.target.value)} aria-label="Vision simulation">{['Protanopia', 'Deuteranopia', 'Tritanopia', 'Achromatopsia'].map(v => <option key={v}>{v}</option>)}</select></div><h3 className="subheading">Original palette</h3><Swatches colors={palette}/><h3 className="subheading">{mode} simulation</h3><Swatches colors={palette.map(c => simulate(c, mode))}/><section className="panel"><h3>Use more than color to communicate.</h3><p>Pair colors with labels, shapes and patterns. These approximate full-severity simulations use linear-light color transformations; individual experiences vary.</p><Link className="text-button" href="/tools/palette-studio">Edit your palette </Link></section><Export text={paletteCSS(palette.map(c => simulate(c, mode)))}/></>; }
function Game({ daily }: {
    daily: boolean;
}) { const [target, setTarget] = useState('#91b9a1'); const [guess, setGuess] = useState([180, 45, 55]); const [score, setScore] = useState<number | null>(null); const [best, setBest] = useState(0); const [date, setDate] = useState(''); const [round, setRound] = useState(1); useEffect(() => { setScore(null); setGuess([180, 45, 55]); setRound(1); const day = new Date().toISOString().slice(0, 10); setDate(day); if (daily) {
    let seed = 0;
    for (const char of day)
        seed = ((seed * 31) + char.charCodeAt(0)) >>> 0;
    setTarget(fromHsl(seed % 360, 35 + seed % 40, 40 + seed % 35));
    try {
        const old = JSON.parse(localStorage.getItem('kolivra-daily-' + day) || 'null');
        if (old) {
            setScore(old.score);
            setGuess(old.guess);
        }
    }
    catch { }
}
else
    setTarget(fromHsl(Math.random() * 360, 35 + Math.random() * 40, 40 + Math.random() * 30)); setBest(Number(localStorage.getItem('kolivra-best') || 0)); }, [daily]); const chosen = fromHsl(...guess as [
    number,
    number,
    number
]); function submit() { const a = rgb(target), b = rgb(chosen); const result = Math.max(0, Math.round(100 * (1 - Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)) / (255 * Math.sqrt(3))))); setScore(result); if (result > best) {
    setBest(result);
    localStorage.setItem('kolivra-best', String(result));
} if (daily)
    localStorage.setItem('kolivra-daily-' + date, JSON.stringify({ score: result, guess })); } return <><div className="panel-heading"><span className="eyebrow">{daily ? `${date} · DAILY CHALLENGE (UTC)` : `PRACTICE · ROUND ${round}`}</span><span className="hint">Personal best: {best}/100</span></div><p className="hint">Recreate the target using hue, saturation and lightness. {daily ? 'One submission per day on this browser.' : 'Practice as many times as you like.'}</p><div className="game-colors"><div style={{ background: target, color: ink(target) }}><span>The target</span><strong>Meet your match.</strong><span>{score !== null ? target.toUpperCase() : 'Look closely.'}</span></div><div style={{ background: chosen, color: ink(chosen) }}><span>Your color</span><strong>{score !== null ? `${score}/100` : 'Trust your eye.'}</strong><span>{score !== null ? chosen.toUpperCase() : 'Make it yours.'}</span></div></div><section className="panel game-controls">{['Hue', 'Saturation', 'Lightness'].map((v, i) => <label className="range-label" key={v}>{v}<b>{Math.round(guess[i])}{i === 0 ? '°' : '%'}</b><input disabled={score !== null} type="range" min="0" max={i === 0 ? 360 : 100} value={guess[i]} onChange={e => setGuess(guess.map((x, j) => j === i ? +e.target.value : x))}/></label>)}{score === null ? <button className="button" onClick={submit}>Reveal my score <Icon /></button> : <div className="game-result" aria-live="polite"><h3>{score >= 90 ? 'An incredible eye for color.' : score >= 70 ? 'You’re getting the hang of hue.' : 'Every color is a little practice.'}</h3><p>Score is based on RGB distance from the target.</p><div className="button-row"><CopyButton text={`myColors ${daily ? 'Daily Color ' + date : 'ColorSense'}: ${score}/100 🎨\n${location.origin}/tools/${daily ? 'daily-color' : 'color-sense'}`} label="Share result"/>{!daily ? <button className="button" onClick={() => { setTarget(fromHsl(Math.random() * 360, 35 + Math.random() * 40, 40 + Math.random() * 30)); setScore(null); setRound(round + 1); }}>Play again </button> : <Link className="button" href="/tools/color-sense">Keep practicing </Link>}</div></div>}</section></>; }
export default function Workspace({ slug }: {
    slug: string;
}) { const tool = toolsList.find(t => t.slug === slug)!; const [base, setBase] = useState('#779d70'); const [palette, setPaletteState] = useState(initialPalette); useEffect(() => { try {
    const stored = JSON.parse(localStorage.getItem('kolivra-palette') || 'null');
    if (Array.isArray(stored) && stored.length === 5 && stored.every(c => typeof c === 'string' && normalize(c))) {
        setPaletteState(stored);
        setBase(stored[0]);
    }
}
catch { } }, []); function setPalette(p: string[]) { setPaletteState(p); setBase(p[0]); localStorage.setItem('kolivra-palette', JSON.stringify(p)); } const withBase = ['hue-match', 'theme-studio', 'color-explorer', 'color-theory'].includes(slug); return <main className="container workspace" id="main"><Link href="/#tools" className="back-link">← All tools</Link><div className="workspace-header"><div><div className="eyebrow">{tool.category.toUpperCase()} / MYCOLORS TOOLBOX</div><h1>{tool.name}<span>.</span></h1><p>{tool.description}</p></div><span className="workspace-icon"><Icon name={tool.icon} size={32}/></span></div>{withBase && <div className="base-bar"><ColorInput label="Your starting color" value={base} onChange={setBase}/><p>Start with a color. See where it takes you.</p><button className="button secondary" onClick={() => setBase(fromHsl(Math.random() * 360, 50, 55))}>↻ Surprise me</button></div>}<div className="workspace-content">{slug === 'theme-studio' && <Theme base={base}/>}{slug === 'palette-studio' && <Palette palette={palette} setPalette={setPalette}/>}{slug === 'gradient-lab' && <Gradient key={palette.join('')} palette={palette}/>}{(slug === 'contrast-checker' || slug === 'color-fix') && <ContrastTool fix={slug === 'color-fix'}/>}{slug === 'image-to-colors' && <Extractor setPalette={setPalette}/>}{slug === 'hue-match' && <Matcher base={base} setPalette={setPalette}/>}{(slug === 'color-explorer' || slug === 'color-theory') && <Explore base={base} theory={slug === 'color-theory'}/>}{slug === 'vision-simulator' && <Vision palette={palette}/>}{(slug === 'color-sense' || slug === 'daily-color') && <Game daily={slug === 'daily-color'}/>}</div><div className="next-tools"><div><div className="eyebrow">KEEP THE IDEAS FLOWING</div><h2>A little more to explore.</h2></div>{toolsList.filter(t => t.slug !== slug && t.category === tool.category).slice(0, 2).concat(toolsList.filter(t => t.category !== tool.category).slice(0, 1)).slice(0, 3).map(t => <Link href={`/tools/${t.slug}`} key={t.slug}><Icon name={t.icon}/><span>{t.name}</span><Icon size={16}/></Link>)}</div></main>; }
