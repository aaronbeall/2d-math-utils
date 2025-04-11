import { Point, Rectangle, Circle, Vector2d, Line } from '../src';

export function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

export function clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function drawPoint(ctx: CanvasRenderingContext2D, p: Point, color = 'blue', size = 5) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
}

export function drawCircle(ctx: CanvasRenderingContext2D, circle: Circle, color = 'blue', fill = false) {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

export function drawLine(ctx: CanvasRenderingContext2D, line: Line, color = 'gray', width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
}

export function drawRect(ctx: CanvasRenderingContext2D, rect: Rectangle, color = 'blue', fill = false) {
    if (fill) {
        ctx.fillStyle = color;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    } else {
        ctx.strokeStyle = color;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
}

export function drawArrow(ctx: CanvasRenderingContext2D, from: Point, to: Point, color = 'blue') {
    const headSize = 10;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    
    drawLine(ctx, { start: from, end: to }, color);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
        to.x - headSize * Math.cos(angle - Math.PI / 6),
        to.y - headSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        to.x - headSize * Math.cos(angle + Math.PI / 6),
        to.y - headSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.fill();
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = 'black', font = '14px monospace') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

type ResultValue = number | string | boolean | Point | Circle | Rectangle | Vector2d | Line;
type ResultEntry = string | [label: string, value: ResultValue, color?: string];

function formatValue(value: ResultValue, precision = 2): string {
    const num = (n: number) => n.toFixed(precision);
    
    if (typeof value === 'number') {
        return num(value);
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'boolean') {
        return value ? '✅ Yes' : '❌ No';
    }
    if ('radius' in value) {
        return `(${num(value.x)}, ${num(value.y)}, r=${num(value.radius)})`;
    }
    if ('width' in value) {
        return `(${num(value.x)}, ${num(value.y)}) [${num(value.width)}×${num(value.height)}]`;
    }
    if ('start' in value) {
        const start = `${num(value.start.x)}, ${num(value.start.y)}`;
        const end = `${num(value.end.x)}, ${num(value.end.y)}`;
        return `(${start}) → (${end})`;
    }
    return `(${num(value.x)}, ${num(value.y)})`;
}

export function drawResults(
    ctx: CanvasRenderingContext2D, 
    results: ResultEntry[], 
    {
        x = 10, 
        y = 20, 
        spacing = 20,
        precision = 2,
        color = 'black'
    }: { 
        x?: number; 
        y?: number; 
        spacing?: number; 
        precision?: number; 
        color?: string 
    } = {}
) {
    results.forEach((entry, i) => {
        const text = Array.isArray(entry)
            ? `${entry[0]}: ${formatValue(entry[1], precision)}`
            : entry;
        drawText(ctx, text, x, y + i * spacing, (Array.isArray(entry) && entry[2]) || color);
    });
}

type HandlerContext = {
    canvas: HTMLCanvasElement;
    draw?: () => void;
    center?: Point; // Optional center point for offsetting mouse positions
};

type DragHandler = {
    onStart?: (pos: Point) => void;
    onDrag?: (pos: Point) => void;
    onEnd?: (pos: Point) => void;
};

/**
 * Calculates the mouse position offset by a given center point.
 * @param canvas The canvas element.
 * @param evt The mouse event.
 * @param center The point to offset the mouse position by.
 * @returns The offset mouse position.
 */
export function getOffsetMousePos(canvas: HTMLCanvasElement, evt: MouseEvent, center: Point = { x: 0, y: 0 }): Point {
    const pos = getMousePos(canvas, evt);
    return {
        x: pos.x - center.x,
        y: pos.y - center.y,
    };
}

/**
 * Adds drag event listeners to the canvas and optionally offsets the mouse position by a center point.
 * @param context The handler context containing the canvas, optional draw function, and optional center.
 * @param handlers The drag event handlers.
 */
export function drag({ canvas, draw, center = { x: 0, y: 0 } }: HandlerContext, handlers: DragHandler) {
    let isDragging = false;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        handlers.onStart?.(getOffsetMousePos(canvas, e, center)) ?? handlers.onDrag?.(getOffsetMousePos(canvas, e, center));
        draw?.();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handlers.onDrag?.(getOffsetMousePos(canvas, e, center));
            draw?.();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDragging) {
            handlers.onEnd?.(getOffsetMousePos(canvas, e, center));
            isDragging = false;
            draw?.();
        }
    });

    canvas.addEventListener('mouseleave', (e) => {
        if (isDragging) {
            handlers.onEnd?.(getOffsetMousePos(canvas, e, center));
            isDragging = false;
            draw?.();
        }
    });
}

/**
 * Adds a click event listener to the canvas and optionally offsets the mouse position by a center point.
 * @param context The handler context containing the canvas, optional draw function, and optional center.
 * @param handler The click event handler.
 */
export function click({ canvas, draw, center = { x: 0, y: 0 } }: HandlerContext, handler: (pos: Point) => void) {
    canvas.addEventListener('click', (e) => {
        handler(getOffsetMousePos(canvas, e, center));
        draw?.();
    });
}

/**
 * Adds a mousemove event listener to the canvas and optionally offsets the mouse position by a center point.
 * @param context The handler context containing the canvas, optional draw function, and optional center.
 * @param handler The mousemove event handler.
 */
export function move({ canvas, draw, center = { x: 0, y: 0 } }: HandlerContext, handler: (pos: Point) => void) {
    canvas.addEventListener('mousemove', (e) => {
        handler(getOffsetMousePos(canvas, e, center));
        draw?.();
    });
}

export function key({ canvas, draw }: HandlerContext, mappings: Record<string, () => void>) {
    // Normalize keys to handle case-insensitivity and special key pairs
    const normalizeKey = (key: string) =>
        ({ '+': '=', '-': '_' }[key.toLowerCase()] ?? key.toLowerCase());

    // Transform mappings into normalized handlers
    const handlers = Object.entries(mappings).reduce((acc, [keys, callback]) => {
        keys.split('').forEach(key => acc[normalizeKey(key.trim())] = callback );
        return acc;
    }, {} as Record<string, () => void>);

    const handler = (e: KeyboardEvent) => {
        const callback = handlers[normalizeKey(e.key)];
        if (callback) {
            callback();
            draw?.();
        }
    };

    canvas.tabIndex = 0;
    canvas.focus();
    canvas.addEventListener('keydown', handler);
    return () => canvas.removeEventListener('keydown', handler);
}

let currentAnimation: number | null = null;

export function animate(draw: () => void, udpate?: () => void) {
    function loop() {
        udpate?.();
        draw();
        currentAnimation = requestAnimationFrame(loop);
    }

    loop();
}

export function simulate(update: (deltaTime: number) => void, draw: () => void) {
    let lastTime = performance.now();
    
    animate(draw, () => {
        const time = performance.now();
        const deltaTime = Math.min((time - lastTime) / 1000, 0.1); // Cap at 100ms
        lastTime = time;

        update(deltaTime);
    });
}

export function reset() {
    if (currentAnimation !== null) {
        cancelAnimationFrame(currentAnimation);
        currentAnimation = null;
    }
    keys.stop();
}

/**
 * Executes a drawing function with the canvas context translated by a given offset.
 * @param ctx The canvas rendering context.
 * @param center The point to offset the context by.
 * @param drawFn The drawing function to execute.
 */
export function drawWithOffset(ctx: CanvasRenderingContext2D, center: Point, drawFn: (ctx: CanvasRenderingContext2D) => void) {
    ctx.save();
    ctx.translate(center.x, center.y);
    drawFn(ctx);
    ctx.restore();
}

/**
 * Draws axes centered around (0,0).
 * @param ctx The canvas rendering context.
 */
export function drawAxes(ctx: CanvasRenderingContext2D) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 1;

    // Draw horizontal axis
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    ctx.stroke();

    // Draw vertical axis
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(0, height / 2);
    ctx.stroke();
}

export const keys = (() => {
    const pressedKeys = new Set<string>();
    let listener: ((e: KeyboardEvent) => void) | null = null;

    return {
        listen() {
            if (listener) return; // Avoid multiple listeners
            listener = (e: KeyboardEvent) => {
                if (e.type === 'keydown') pressedKeys.add(e.code);
                if (e.type === 'keyup') pressedKeys.delete(e.code);
            };
            window.addEventListener('keydown', listener);
            window.addEventListener('keyup', listener);
        },
        isDown(keyCode: string) {
            return pressedKeys.has(keyCode);
        },
        stop() {
            if (listener) {
                window.removeEventListener('keydown', listener);
                window.removeEventListener('keyup', listener);
                listener = null;
                pressedKeys.clear();
            }
        }
    };
})();