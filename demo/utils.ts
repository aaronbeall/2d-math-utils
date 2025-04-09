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
type ResultEntry = string | [string, ResultValue];

function formatValue(value: ResultValue, precision = 0): string {
    if (typeof value === 'boolean') {
        return value ? '✅ Yes' : '❌ No';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return value.toFixed(precision);
    }
    if ('radius' in value) {
        return `(${value.x.toFixed(0)}, ${value.y.toFixed(0)}, r=${value.radius.toFixed(0)})`;
    }
    if ('width' in value) {
        return `(${value.x.toFixed(0)}, ${value.y.toFixed(0)}) [${value.width.toFixed(0)}×${value.height.toFixed(0)}]`;
    }
    if ('start' in value) {
        return `(${value.start.x.toFixed(0)}, ${value.start.y.toFixed(0)}) → (${value.end.x.toFixed(0)}, ${value.end.y.toFixed(0)})`;
    }
    return `(${value.x.toFixed(0)}, ${value.y.toFixed(0)})`;
}

export function drawResults(
    ctx: CanvasRenderingContext2D, 
    results: ResultEntry[], 
    x = 10, 
    y = 20, 
    spacing = 20,
    precision = 0
) {
    results.forEach((entry, i) => {
        const text = Array.isArray(entry)
            ? `${entry[0]}: ${formatValue(entry[1], precision)}`
            : entry;
        drawText(ctx, text, x, y + i * spacing);
    });
}

type HandlerContext = {
    canvas: HTMLCanvasElement;
    draw?: () => void;
};

type DragHandler = {
    onStart?: (pos: Point) => void;
    onDrag?: (pos: Point) => void;
    onEnd?: (pos: Point) => void;
};

export function drag({ canvas, draw }: HandlerContext, handlers: DragHandler) {
    let isDragging = false;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        handlers.onStart?.(getMousePos(canvas, e));
        draw?.();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handlers.onDrag?.(getMousePos(canvas, e));
            draw?.();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDragging) {
            handlers.onEnd?.(getMousePos(canvas, e));
            isDragging = false;
            draw?.();
        }
    });

    canvas.addEventListener('mouseleave', (e) => {
        if (isDragging) {
            handlers.onEnd?.(getMousePos(canvas, e));
            isDragging = false;
            draw?.();
        }
    });
}

export function click({ canvas, draw }: HandlerContext, handler: (pos: Point) => void) {
    canvas.addEventListener('click', (e) => {
        handler(getMousePos(canvas, e));
        draw?.();
    });
}

export function move({ canvas, draw }: HandlerContext, handler: (pos: Point) => void) {
    canvas.addEventListener('mousemove', (e) => {
        handler(getMousePos(canvas, e));
        draw?.();
    });
}

export function key({ canvas, draw }: HandlerContext, mappings: Record<string, () => void>) {
    // Transform mappings to support arrays of keys
    const handlers = Object.entries(mappings).reduce((acc, [keys, callback]) => {
        keys.split('').forEach(key => acc[key.trim()] = callback);
        return acc;
    }, {} as Record<string, () => void>);
    
    const handler = (e: KeyboardEvent) => {
        const callback = handlers[e.key];
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
