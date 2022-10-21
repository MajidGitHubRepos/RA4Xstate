import { createMachine } from 'xstate';

export const behaviorMachine = createMachine({
    id: 'behavior',
    initial: 's0',
    states: {
      s0: {
        on: {
          t1: { 
            target: 's1', actions:['logM1'] 
          },
          t2: { 
            target: 's1', actions:['logM2'] 
          },
        },
      },
      s1: {},
    }
  }).withConfig({ //it alows us to specify actions and etc.
    actions: {
        'logM1': () => console.log('t1 was processed in bsm!'),
        'logM2': () => console.log('t2 was processed in bsm!'),
    }
});