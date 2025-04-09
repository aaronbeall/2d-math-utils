import * as line from '../../src/line';
import { DemoFunction } from './index';

export const lineDemos: Record<keyof typeof line, DemoFunction> = {
    lineLength: (canvas) => {
        // Interactive demo showing line length with draggable endpoints
    }
};
