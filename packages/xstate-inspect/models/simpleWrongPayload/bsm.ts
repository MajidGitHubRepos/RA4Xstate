import { createMachine } from 'xstate';

export const behaviorMachine = createMachine({
    id: 'behavior',
    initial: 's0',
    context: {
      x: 3,
    },
    states: {
      s0: {
        on: {
          t1: { 
            cond: (context) => context.x % 2 == 0, 
            target: 's1', actions:['logM1'] 
          },
          t2: {
            cond: (context) => context.x % 2 != 0,  
            target: 's2', actions:['logM2'] 
          },
        },
      },
      s1: {},
      s2: {
        on:{
          t3: { target: 's1', actions:['logM3'] },
        }
      },
    }
  }).withConfig({ //it alows us to specify actions and etc.
    actions: {
        'logM1': () => console.log('t1 was processed in bsm!'),
        'logM2': () => console.log('t2 was processed in bsm!'),
        'logM3': () => console.log('t3 was processed in bsm!'),
    }
});