# RATEN

Robustness analysis is vital for ensuring the reliability of software systems, particularly those with complex state-based behaviors. In this paper, we introduce RATEN, Robustness Analysis and Test Enhancement Framework for State Machines, a novel framework that leverages quantitative metrics and model-driven techniques to evaluate and enhance robustness. RATEN integrates behavioral and property models to identify common robustness failures (CRFs) and applies cost-based metrics to assess the ability of systems to recover from unexpected states. The framework also features a querying mechanism compatible with existing replay-based testing methods, enabling significant reductions in the size of the test suite while maintaining precision and recall. 

## quick start

```bash
npm install xstate
```

```js
import { createMachine, interpret } from 'xstate';

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } }
  }
});

// Machine instance with internal state
const toggleService = interpret(toggleMachine)
  .onTransition((state) => console.log(state.value))
  .start();
// => 'inactive'

toggleService.send('TOGGLE');
// => 'active'

toggleService.send('TOGGLE');
// => 'inactive'
```

## Promise example

[📉 See the visualization on stately.ai/viz](https://stately.ai/viz?gist=bbcb4379b36edea0458f597e5eec2f91)

<details>
<summary>See the code</summary>

```js
import { createMachine, interpret, assign } from 'xstate';

const fetchMachine = createMachine({
  id: 'Dog API',
  initial: 'idle',
  context: {
    dog: null
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading'
      }
    },
    loading: {
      invoke: {
        id: 'fetchDog',
        src: (context, event) =>
          fetch('https://dog.ceo/api/breeds/image/random').then((data) =>
            data.json()
          ),
        onDone: {
          target: 'resolved',
          actions: assign({
            dog: (_, event) => event.data
          })
        },
        onError: 'rejected'
      },
      on: {
        CANCEL: 'idle'
      }
    },
    resolved: {
      type: 'final'
    },
    rejected: {
      on: {
        FETCH: 'loading'
      }
    }
  }
});

const dogService = interpret(fetchMachine)
  .onTransition((state) => console.log(state.value))
  .start();

dogService.send('FETCH');
```

</details>
## Finite State Machines

<a href="https://stately.ai/viz/2ac5915f-789a-493f-86d3-a8ec079773f4" title="Finite states">
  <img src="https://user-images.githubusercontent.com/1093738/131727631-916d28a7-1a40-45ed-8636-c0c0fc1c3889.gif" alt="Finite states" width="400" />
  <br />
  <small>Open in Stately Viz</small>
</a>
<br />

```js
import { createMachine } from 'xstate';

const lightMachine = createMachine({
  id: 'light',
  initial: 'green',
  states: {
    green: {
      on: {
        TIMER: 'yellow'
      }
    },
    yellow: {
      on: {
        TIMER: 'red'
      }
    },
    red: {
      on: {
        TIMER: 'green'
      }
    }
  }
});

const currentState = 'green';

const nextState = lightMachine.transition(currentState, 'TIMER').value;

// => 'yellow'
```

## Hierarchical (Nested) State Machines

<a href="https://stately.ai/viz/d3aeda4f-7f8e-44df-bdf9-dd3cdafb3312" title="Hierarchical states">
  <img src="https://user-images.githubusercontent.com/1093738/131727794-86b63c76-5ee0-4d73-b84c-6992a1f0814e.gif" alt="Hierarchical states" width="400" />
  <br />
  <small>Open in Stately Viz</small>
</a>
<br />

```js
import { createMachine } from 'xstate';

const pedestrianStates = {
  initial: 'walk',
  states: {
    walk: {
      on: {
        PED_TIMER: 'wait'
      }
    },
    wait: {
      on: {
        PED_TIMER: 'stop'
      }
    },
    stop: {}
  }
};

const lightMachine = createMachine({
  id: 'light',
  initial: 'green',
  states: {
    green: {
      on: {
        TIMER: 'yellow'
      }
    },
    yellow: {
      on: {
        TIMER: 'red'
      }
    },
    red: {
      on: {
        TIMER: 'green'
      },
      ...pedestrianStates
    }
  }
});

const currentState = 'yellow';

const nextState = lightMachine.transition(currentState, 'TIMER').value;
// => {
//   red: 'walk'
// }

lightMachine.transition('red.walk', 'PED_TIMER').value;
// => {
//   red: 'wait'
// }
```

**Object notation for hierarchical states:**

```js
// ...
const waitState = lightMachine.transition({ red: 'walk' }, 'PED_TIMER').value;

// => { red: 'wait' }

lightMachine.transition(waitState, 'PED_TIMER').value;

// => { red: 'stop' }

lightMachine.transition({ red: 'stop' }, 'TIMER').value;

// => 'green'
```

## Parallel State Machines

<a href="https://stately.ai/viz/9eb9c189-254d-4c87-827a-fab0c2f71508" title="Parallel states">
  <img src="https://user-images.githubusercontent.com/1093738/131727915-23da4b4b-5e7e-46ea-9c56-5093e37e60e6.gif" alt="Parallel states" width="400" />
  <br />
  <small>Open in Stately Viz</small>
</a>
<br />

```js
const wordMachine = createMachine({
  id: 'word',
  type: 'parallel',
  states: {
    bold: {
      initial: 'off',
      states: {
        on: {
          on: { TOGGLE_BOLD: 'off' }
        },
        off: {
          on: { TOGGLE_BOLD: 'on' }
        }
      }
    },
    underline: {
      initial: 'off',
      states: {
        on: {
          on: { TOGGLE_UNDERLINE: 'off' }
        },
        off: {
          on: { TOGGLE_UNDERLINE: 'on' }
        }
      }
    },
    italics: {
      initial: 'off',
      states: {
        on: {
          on: { TOGGLE_ITALICS: 'off' }
        },
        off: {
          on: { TOGGLE_ITALICS: 'on' }
        }
      }
    },
    list: {
      initial: 'none',
      states: {
        none: {
          on: { BULLETS: 'bullets', NUMBERS: 'numbers' }
        },
        bullets: {
          on: { NONE: 'none', NUMBERS: 'numbers' }
        },
        numbers: {
          on: { BULLETS: 'bullets', NONE: 'none' }
        }
      }
    }
  }
});

const boldState = wordMachine.transition('bold.off', 'TOGGLE_BOLD').value;

// {
//   bold: 'on',
//   italics: 'off',
//   underline: 'off',
//   list: 'none'
// }

const nextState = wordMachine.transition(
  {
    bold: 'off',
    italics: 'off',
    underline: 'on',
    list: 'bullets'
  },
  'TOGGLE_ITALICS'
).value;

// {
//   bold: 'off',
//   italics: 'on',
//   underline: 'on',
//   list: 'bullets'
// }
```

## History States

<a href="https://stately.ai/viz/33fd92e1-f9e6-49e6-bdeb-cef9e60195ec" title="History states">
  <img src="https://user-images.githubusercontent.com/1093738/131728111-819cc824-9881-4ecf-948a-00c1162cd9e9.gif" alt="History state" width="400" />
  <br />
  <small>Open in Stately Viz</small>
</a>
<br />

```js
const paymentMachine = createMachine({
  id: 'payment',
  initial: 'method',
  states: {
    method: {
      initial: 'cash',
      states: {
        cash: { on: { SWITCH_CHECK: 'check' } },
        check: { on: { SWITCH_CASH: 'cash' } },
        hist: { type: 'history' }
      },
      on: { NEXT: 'review' }
    },
    review: {
      on: { PREVIOUS: 'method.hist' }
    }
  }
});

const checkState = paymentMachine.transition('method.cash', 'SWITCH_CHECK');

// => State {
//   value: { method: 'check' },
//   history: State { ... }
// }

const reviewState = paymentMachine.transition(checkState, 'NEXT');

// => State {
//   value: 'review',
//   history: State { ... }
// }

const previousState = paymentMachine.transition(reviewState, 'PREVIOUS').value;

// => { method: 'check' }
```
