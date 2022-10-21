
///
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
it('simpleWrongMessage senario', async () => {
  let ra = new RobustnessAnalysis();
  const tracePath = './packages/xstate-inspect/models/simpleWrongMessage/traces.txt';
  const bsm = '../models/simpleWrongMessage/bsm';
  const psm = '../models/simpleWrongMessage/psm';
  ra.setTracePath(tracePath);
  ra.setModels(bsm,psm);
  let acceptableCost = 2;
  let TTCost = await ra.testInit(acceptableCost);
  expect(parseInt(''+TTCost)).toEqual(1);
});


it('simpleWrongPayload senario', async () => {
  let ra = new RobustnessAnalysis();
  const tracePath = './packages/xstate-inspect/models/simpleWrongPayload/traces.txt';
  const bsm = '../models/simpleWrongPayload/bsm';
  const psm = '../models/simpleWrongPayload/psm';
  ra.setTracePath(tracePath);
  ra.setModels(bsm,psm);
  let acceptableCost = 2;
  let TTCost = await ra.testInit(acceptableCost);
  expect(parseInt(''+TTCost)).toEqual(1);
});

it('simpleMissingMessage senario', async () => {
  let ra = new RobustnessAnalysis();
  const tracePath = './packages/xstate-inspect/models/simpleMissingMessage/traces.txt';
  const bsm = '../models/simpleMissingMessage/bsm';
  const psm = '../models/simpleMissingMessage/psm';
  ra.setTracePath(tracePath);
  ra.setModels(bsm,psm);
  let acceptableCost = 2;
  let TTCost = await ra.testInit(acceptableCost);
  expect(parseInt(''+TTCost)).toEqual(1);
});


})