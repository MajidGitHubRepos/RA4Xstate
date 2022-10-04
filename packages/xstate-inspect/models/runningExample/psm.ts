import { actions, assign, createMachine, interpret, send } from 'xstate';
import { raise } from 'xstate/lib/actions';
const { respond } = actions;

export const propertyMachine = createMachine({
  id: 'property',
  context: {
    X: 1,
  },
  initial: 'good',
  states: {
    good: {
      on: {
        MONE: {
          actions: [
            respond('MZERO', { delay: 1000 }),
            assign({
              X: (_, e) => e.myParam,
            }),
          ],
          target: 'good',
        },
        MTWO: {
          actions: [
            respond('MZERO', { delay: 1000 }),
            assign({
              X: (_, e) => e.myParam,
            }),
            raise('CHONE'),
          ],
        },
        MTHREE: {
          actions: [
            respond('MZERO', { delay: 1000 }),
            assign({
              X: (_, e) => e.myParam,
            }),
          ],

          target: 'bad',
        },
      },
    },
    bad: {
      entry: raise('CHTWO'),
      on: {
        CHTWO: {
          cond: (context) => context.X % 5 === 0,
          target: 'good',
        },
      },
    },
  },
  on: {
    CHONE: [
      {
        cond: (context) => context.X % 2 === 0,
        target: 'good',
      },
      {
        target: 'bad',
      },
    ],
  },
});
