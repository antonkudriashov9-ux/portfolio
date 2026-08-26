'use client';

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { Sparkles, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatrixNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
    col: number;
    row: number;
    radius: number;
    label: string;
    tension: number;
    pulsePhase: number;
}

interface SynapticPulse {
    fromNode: number;
    toNode: number;
    progress: number;
    speed: number;
}

interface GravitationalShockwave {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    power: number;
}

const SYSTEM_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const subscribeSystemScheme = (cb: () => void) => {
    const mq = window.matchMedia(SYSTEM_SCHEME_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};
const getSystemSchemeSnapshot = () => window.matchMedia(SYSTEM_SCHEME_QUERY).matches;

const drawLatticeLink = (
    ctx: CanvasRenderingContext2D,
    n1: MatrixNode,
    n2: MatrixNode,
    restLen: number,
    isDark: boolean,
    nodeColor: string
) => {
    const dx = n1.x - n2.x;
    const dy = n1.y - n2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const stretch = Math.abs(dist - restLen) / restLen;
    const isTensioned = n1.tension > 0.05 || n2.tension > 0.05 || stretch > 0.1;

    if (isTensioned) {
        const glow = Math.max(n1.tension, n2.tension, stretch * 2);
        ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${Math.min(1, 0.25 + glow * 0.75)})`
            : `rgba(0, 0, 0, ${Math.min(1, 0.25 + glow * 0.75)})`;
        ctx.lineWidth = 0.8 + glow * 1.4;
    } else {
        ctx.strokeStyle = `rgba(${nodeColor}, ${isDark ? 0.08 : 0.05})`;
        ctx.lineWidth = 0.65;
    }

    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.stroke();
};

export interface KineticMatrixProps {
    title?: string;
    className?: string;
    spacing?: number;
}

export function KineticMatrix({
    title = "TOPOLOGY",
    className = "",
    spacing: spacingProp,
}: KineticMatrixProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isRunning, setIsRunning] = useState(true);

    // Sync color scheme preference
    const isDarkMode = useSyncExternalStore(
        subscribeSystemScheme,
        getSystemSchemeSnapshot,
        () => true
    );

    // Pointer state with smooth inertia
    const pointerRef = useRef({
        x: -2000,
        y: -2000,
        prevX: -2000,
        prevY: -2000,
        vx: 0,
        vy: 0,
        radius: 220,
        isDown: false,
    });

    const nodesRef = useRef<MatrixNode[]>([]);
    const pulsesRef = useRef<SynapticPulse[]>([]);
    const shockwavesRef = useRef<GravitationalShockwave[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0, cols: 0, rows: 0, spacing: 52 });
    const spacingRef = useRef(spacingProp ?? 52);

    useEffect(() => {
        spacingRef.current = spacingProp ?? 52;
    }, [spacingProp]);

    // Grid lattice initializer
    const buildLattice = useCallback((width: number, height: number) => {
        const spacing = spacingRef.current;
        const cols = Math.ceil(width / spacing) + 1;
        const rows = Math.ceil(height / spacing) + 1;
        const nodes: MatrixNode[] = [];

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const x = c * spacing;
                const y = r * spacing;
                nodes.push({
                    x,
                    y,
                    vx: 0,
                    vy: 0,
                    baseX: x,
                    baseY: y,
                    col: c,
                    row: r,
                    radius: 1.4,
                    label: `0x${((c * 17 + r * 31) % 256).toString(16).padStart(2, '0').toUpperCase()}`,
                    tension: 0,
                    pulsePhase: Math.random() * Math.PI * 2,
                });
            }
        }

        dimensionsRef.current = { width, height, cols, rows, spacing };
        nodesRef.current = nodes;
        pulsesRef.current = [];
    }, []);

    // Canvas Resize Observer with subpixel rounding correction
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const rect = entry.contentRect;
                const dpr = Math.min(window.devicePixelRatio || 1, 2);

                canvas.width = Math.floor(rect.width * dpr);
                canvas.height = Math.floor(rect.height * dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                buildLattice(rect.width, rect.height);
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [buildLattice]);

    // Main High-Performance Simulation & Rendering Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animId = 0;
        let lastTime = performance.now();

        const render = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.033);
            lastTime = now;

            if (!isRunning) {
                animId = requestAnimationFrame(render);
                return;
            }

            const { width, height, cols, rows, spacing } = dimensionsRef.current;
            const nodes = nodesRef.current;
            const pulses = pulsesRef.current;
            const shockwaves = shockwavesRef.current;
            const pointer = pointerRef.current;

            // Pointer velocity interpolation
            pointer.vx = (pointer.x - pointer.prevX) / (dt * 1000 || 1);
            pointer.vy = (pointer.y - pointer.prevY) / (dt * 1000 || 1);
            pointer.prevX = pointer.x;
            pointer.prevY = pointer.y;
            const mouseSpeed = Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy);

            const isDark = document.documentElement.classList.contains('dark') || isDarkMode;
            const bgColor = isDark ? '#06070a' : '#f9fafb';
            const nodeColor = isDark ? '255, 255, 255' : '17, 24, 39';
            const accentGlow = isDark ? '255, 255, 255' : '0, 0, 0';

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            // 1. Propagate Shockwaves
            for (let s = shockwaves.length - 1; s >= 0; s--) {
                const sw = shockwaves[s];
                sw.radius += 400 * dt;
                sw.power *= Math.pow(0.12, dt);
                if (sw.radius > sw.maxRadius || sw.power < 0.01) {
                    shockwaves.splice(s, 1);
                }
            }

            // 2. Physics Step (Hooke's Spring-Mass Lattice)
            const SPRING_K = 26;
            const DAMPING = 0.85;

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.pulsePhase += dt * 3.2;

                const dx = pointer.x - n.x;
                const dy = pointer.y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < pointer.radius && dist > 0) {
                    const ratio = 1 - dist / pointer.radius;
                    const force = ratio * (1600 + mouseSpeed * 180 + (pointer.isDown ? 2400 : 0));
                    const angle = Math.atan2(dy, dx);

                    n.vx -= Math.cos(angle) * force * dt;
                    n.vy -= Math.sin(angle) * force * dt;
                    n.tension = Math.min(1, n.tension + ratio * 0.5);
                }

                for (let s = 0; s < shockwaves.length; s++) {
                    const sw = shockwaves[s];
                    const swDx = n.x - sw.x;
                    const swDy = n.y - sw.y;
                    const swDist = Math.sqrt(swDx * swDx + swDy * swDy);
                    const delta = Math.abs(swDist - sw.radius);

                    if (delta < 55) {
                        const force = (1 - delta / 55) * sw.power * 2800;
                        const angle = Math.atan2(swDy, swDx);
                        n.vx += Math.cos(angle) * force * dt;
                        n.vy += Math.sin(angle) * force * dt;
                        n.tension = 1.0;
                    }
                }

                const hx = n.baseX - n.x;
                const hy = n.baseY - n.y;
                n.vx += hx * SPRING_K * dt;
                n.vy += hy * SPRING_K * dt;

                n.vx *= DAMPING;
                n.vy *= DAMPING;
                n.x += n.vx * dt * 60;
                n.y += n.vy * dt * 60;

                n.tension = Math.max(0, n.tension - dt * 0.9);
            }

            // 3. Spawn Random Synaptic Traveling Pulses
            if (Math.random() < 0.3 && nodes.length > 0 && pulses.length < 40) {
                const fromIdx = Math.floor(Math.random() * nodes.length);
                const fromNode = nodes[fromIdx];
                const possibleDirections = [
                    { dc: 1, dr: 0 },
                    { dc: -1, dr: 0 },
                    { dc: 0, dr: 1 },
                    { dc: 0, dr: -1 },
                ];
                const dir = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                const targetCol = fromNode.col + dir.dc;
                const targetRow = fromNode.row + dir.dr;

                if (targetCol >= 0 && targetCol < cols && targetRow >= 0 && targetRow < rows) {
                    const toIdx = targetCol * rows + targetRow;
                    if (toIdx >= 0 && toIdx < nodes.length) {
                        pulses.push({
                            fromNode: fromIdx,
                            toNode: toIdx,
                            progress: 0,
                            speed: 1.6 + Math.random() * 2.2,
                        });
                    }
                }
            }

            // 4. Render Grid Tension Strands
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const idx = c * rows + r;
                    const n = nodes[idx];
                    if (!n) continue;

                    if (c < cols - 1) {
                        const rightIdx = (c + 1) * rows + r;
                        const nr = nodes[rightIdx];
                        if (nr) drawLatticeLink(ctx, n, nr, spacing, isDark, nodeColor);
                    }

                    if (r < rows - 1) {
                        const downIdx = c * rows + (r + 1);
                        const nd = nodes[downIdx];
                        if (nd) drawLatticeLink(ctx, n, nd, spacing, isDark, nodeColor);
                    }
                }
            }

            // 5. Render Synaptic Data Pulses
            for (let p = pulses.length - 1; p >= 0; p--) {
                const pulse = pulses[p];
                pulse.progress += dt * pulse.speed;

                const n1 = nodes[pulse.fromNode];
                const n2 = nodes[pulse.toNode];

                if (!n1 || !n2 || pulse.progress >= 1) {
                    if (n2) n2.tension = Math.min(1, n2.tension + 0.35);
                    pulses.splice(p, 1);
                    continue;
                }

                const px = n1.x + (n2.x - n1.x) * pulse.progress;
                const py = n1.y + (n2.y - n1.y) * pulse.progress;

                ctx.fillStyle = isDark ? '#ffffff' : '#000000';
                ctx.beginPath();
                ctx.arc(px, py, 2.0, 0, Math.PI * 2);
                ctx.fill();
            }

            // 6. Render Nodes & HUD Elements
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const dx = pointer.x - n.x;
                const dy = pointer.y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const isNear = dist < pointer.radius;

                const currentRadius = isNear
                    ? n.radius * 2.2 + n.tension * 1.5
                    : n.radius + Math.sin(n.pulsePhase) * 0.25;

                if (isNear || n.tension > 0.1) {
                    ctx.fillStyle = `rgba(${accentGlow}, ${Math.min(1, 0.25 + n.tension * 0.65)})`;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, currentRadius * 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = isNear || n.tension > 0.1
                    ? (isDark ? '#ffffff' : '#000000')
                    : `rgba(${nodeColor}, ${isDark ? 0.28 : 0.2})`;

                ctx.beginPath();
                ctx.arc(n.x, n.y, Math.max(0.8, currentRadius), 0, Math.PI * 2);
                ctx.fill();

                if (dist < 90) {
                    const radarRing = ((n.pulsePhase * 20) % 32) + 4;
                    const ringAlpha = (1 - radarRing / 36) * 0.35;

                    ctx.strokeStyle = `rgba(${accentGlow}, ${ringAlpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, radarRing, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.font = '8px ui-monospace, SFMono-Regular, Consolas, monospace';
                    ctx.fillStyle = `rgba(${accentGlow}, 0.85)`;
                    ctx.fillText(n.label, n.x + 9, n.y - 9);
                }
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [isRunning, isDarkMode]);

    const triggerCentralImpulse = useCallback(() => {
        const { width, height } = dimensionsRef.current;
        shockwavesRef.current.push({
            x: width / 2,
            y: height / 2,
            radius: 10,
            maxRadius: Math.max(width, height) * 0.85,
            power: 1.4,
        });
    }, []);

    // Внешний триггер ударной волны (⌘K → «Импульс»)
    useEffect(() => {
        const handler = () => triggerCentralImpulse();
        window.addEventListener('kinetic:pulse', handler);
        return () => window.removeEventListener('kinetic:pulse', handler);
    }, [triggerCentralImpulse]);

    const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        pointerRef.current.x = e.clientX - rect.left;
        pointerRef.current.y = e.clientY - rect.top;
    };

    const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        pointerRef.current.isDown = true;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        shockwavesRef.current.push({
            x,
            y,
            radius: 8,
            maxRadius: 420,
            power: 1.2,
        });
    };

    const handlePointerUp = () => {
        pointerRef.current.isDown = false;
    };

    const handlePointerLeave = () => {
        pointerRef.current.x = -2000;
        pointerRef.current.y = -2000;
        pointerRef.current.isDown = false;
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handlePointerMove}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerLeave}
            className={cn(
                "group relative flex h-full w-full select-none flex-col justify-between overflow-hidden bg-neutral-50 transition-colors duration-700 dark:bg-[#06070a]",
                className
            )}
        >
            {/* Absolute Edge-to-Edge Canvas Viewport */}
            <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full cursor-crosshair" />

            {/* Content Deck Wrapper with Safe Padding */}
            <div className="relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-10">
                {/* Top Header Deck */}
                <header className="flex w-full items-center justify-between pt-12 font-mono text-[11px] text-neutral-500 md:pt-14 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={triggerCentralImpulse}
                            className="flex items-center gap-1.5 rounded-lg border border-neutral-300/80 bg-white/70 px-2.5 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:bg-neutral-800"
                            title="Trigger Shockwave"
                        >
                            <Sparkles className="size-3 text-neutral-800 dark:text-neutral-200" />
                            <span className="hidden sm:inline font-mono text-[10px]">PULSE</span>
                        </button>

                        <button
                            onClick={() => setIsRunning((prev) => !prev)}
                            className="flex items-center gap-1.5 rounded-lg border border-neutral-300/80 bg-white/70 px-2.5 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:bg-neutral-800"
                        >
                            {isRunning ? <Pause className="size-3" /> : <Play className="size-3" />}
                            <span className="font-mono text-[10px]">{isRunning ? "FREEZE" : "RUN"}</span>
                        </button>
                    </div>
                </header>

                {/* Center Hero Stencil Typography */}
                <main className="pointer-events-none flex flex-col items-center justify-center text-center">
                    <h1 className="font-mono text-5xl font-black tracking-tighter uppercase sm:text-7xl md:text-9xl text-neutral-900 dark:text-white">
                        {title}
                    </h1>
                </main>

                <div />
            </div>
        </div>
    );
}

export default KineticMatrix;
