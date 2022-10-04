export {
  inspect,
  createWindowReceiver,
  createWebSocketReceiver,
  createDevTools
} from './browser';
import { readFileSync } from 'fs';
window.open = jest.fn();


export function readTraces(): void {
  const file = readFileSync('./packages/xstate-inspect/src/traces.txt', 'utf-8');
  var lines = file.split('\n');
    for (var line = 0; line < lines.length; line++) {
      console.debug(lines[line]); 
    }
  // return selectivelyStringify(
  //   stateToStringify,
  //   ['context', 'event', '_event'],
  //   replacer
  // );
}