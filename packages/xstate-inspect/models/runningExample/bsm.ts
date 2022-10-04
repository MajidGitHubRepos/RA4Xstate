import { actions, assign, createMachine, interpret, send } from 'xstate';
import { raise } from 'xstate/lib/actions';
const { respond } = actions;

export const behaviorMachine = createMachine({
    id: 'behavior',
    initial: 'idle',
    states: {
      idle: {
        on: {
          M1: { target: 'First', actions:['logM1'] },
          M2: { target: 'Second', actions:['logM2'] },
          M3: { target: 'Third', actions:['logM3'] },
        },
      },
      First: {},
      Second: {},
      Third: {},
    }
  }).withConfig({ //it alows us to specify actions and etc.
    actions: {
        'logM1': () => console.log('M1 msg processed in bsm!'),
        'logM2': () => console.log('M2 msg processed in bsm!'),
    }
  //       'updateContextT1': assign({
  //           count: 100
  //       }),
  //       'fun1': () => console.log('You just entered to s1!'),
  //       'updateContextS1': assign({
  //           count: (context) => context.count + 25,
  //       }),
  //       'updateContextT3WithEvePayload': assign({
  //           count: (context, event) => context.count * event.value,
  //       }),
  //       'updateContextT5': assign({
  //           count: (context) => context.count + 1,
  //       })
  //   },
  //   guards: {
  //     'condInT3': (context) => context.count == 125,
  // }
});


// export const behaviorMachine = createMachine({
//   id: 'behavior',
//   initial: 'idle',
//   states: {
//     idle: {
//       on: {
//         M1: { target: 'First' },
//         M2: { target: 'Second' },
//         M3: { target: 'Third' },
//       },
//     },
//     First: {
//       invoke: {
//         id: 'property',
//         src: propertyMachine,
//       },
//       entry: send({ type: 'MONE', myParam: 2 }, { to: 'property' }),
//       on: {
//         MZERO: { target: 'idle' },
//       },
//     },
//     Second: {
//       invoke: {
//         id: 'property',
//         src: propertyMachine,
//       },
//       entry: send(
//         { type: 'MTWO', myParam: Math.floor(Math.random() * 100) },
//         { to: 'property' },
//       ),
//       on: {
//         MZERO: { target: 'idle' },
//       },
//     },
//     Third: {
//       invoke: {
//         id: 'property',
//         src: propertyMachine,
//       },
//       entry: send({ type: 'MTHREE', myParam: 7 }, { to: 'property' }),
//       on: {
//         MZERO: { target: 'idle' },
//       },
//     },
//   },
// });

// const service = interpret(behaviorMachine).start(); //behaviorMachine, propertyMachine
// service.subscribe((state) => {
//   console.log(state.event, state.value, state.context);
// });
// window.service = service;
