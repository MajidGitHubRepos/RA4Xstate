import { assign, createMachine } from 'xstate';

//s0 = Good
//s1 = Bad
/*
export const propertyMachine = createMachine({
    id: 'property',
    initial: 's0',
    context: {
      cost: 0,
    },
    states: {
      s0: {
        on: {
          t1: { target: 's0', actions:['logM1'] },
          t2: { target: 's1', actions:['logM2','setCost'] },
        },
      },
      s1: {
        on:{
          t3: { target: 's0', actions:['logM3','resetCost'] },
        }
      },
    }
  }).withConfig({ //it alows us to specify actions and etc.
    actions: {
        'logM1': () => console.log('t1 was processed in psm!'),
        'logM2': () => console.log('t2 was processed in psm!'),
        'logM3': () => console.log('t3 was processed in psm!'),
        'setCost': () => assign({cost: 1}),
        'resetCost': () => assign({cost: 0})
    }
});
*/


export const propertyMachine = createMachine({
  id: 'property',
  initial: 'Good',
  context: {
    cost: 0,
  },
  states: {
    Good: {
      on: {
        t1: { target: 'Good', actions:['logM1'] },
        t2: { target: 'Bad', actions:['logM2',() => assign({cost: 1})] },
      },
    },
    Bad: {
      on:{
        t3: { target: 'Good', actions:['logM3',() => assign({cost: 0})] },
      }
    },
  }
}).withConfig({ //it alows us to specify actions and etc.
  actions: {
      'logM1': () => console.log('t1 was processed in psm!'),
      'logM2': () => console.log('t2 was processed in psm!'),
      'logM3': () => console.log('t3 was processed in psm!')
  }
});