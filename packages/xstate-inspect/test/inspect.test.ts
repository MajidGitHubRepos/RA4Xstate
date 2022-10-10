// import { debug } from "console";
// import { debug } from 'console';
// import { behaviorMachine } from '../models/simpleWrongMessage/bsm'
// import { propertyMachine } from '../models/simpleWrongMessage/psm';
// import { run, testInit, getTrace, replayBSM, replayPSM, staticAnalysis, getNumOfTraces, setTracePath, setModels} from '../src/robustnessAnalysis'
// import { raise } from 'xstate/lib/actions';
// import { testInit, setTracePath, setModels} from '../src/robustnessAnalysis'
import {RobustnessAnalysis} from '../src/robustnessAnalysis'
// import { debug } from 'console';
// import { init } from 'xstate/lib/actionTypes';
// import { run } from 'tslint/lib/runner';
// import { debug } from 'console';

afterEach(() => {
  // this clears timers, removes global listeners etc
  // I'm not sure if this is 100% safe to do
  // it's not clear if the window  object after this operation is still usable in the same way (is it recyclable?)
  // it does seem to cover our needs so far though
  window.close();
});




describe('@Robustness Analysis of Varios Models', () => {
  window.open = jest.fn()
it('simpleWrongMessage senario', () => {
  let ra = new RobustnessAnalysis();
  // staticAnalysis(behaviorMachine,propertyMachine)
  const tracePath = './packages/xstate-inspect/src/traces.txt';
  const bsm = '../models/simpleWrongMessage/bsm';
  const psm = '../models/simpleWrongMessage/psm';
  ra.setTracePath(tracePath);
  ra.setModels(bsm,psm);
  ra.testInit();
  // raRun();

});

})