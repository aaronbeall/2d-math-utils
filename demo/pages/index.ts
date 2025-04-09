import { pointDemos } from './point';
import { angleDemos } from './angle';
import { lineDemos } from './line';
import { vectorDemos } from './vector';
import { physicsDemos } from './physics';
import { bodyDemos } from './body';

export const demos = {
    point: pointDemos,
    angle: angleDemos,
    line: lineDemos,
    vector: vectorDemos,
    physics: physicsDemos,
    body: bodyDemos
};

export type DemoFunction = (canvas: HTMLCanvasElement) => void;
