import { interpret } from 'xstate';
import { debug } from "console";
import { createDevTools, inspect } from '../src';
import { behaviorMachine } from '../models/simpleWrongMessage/bsm'
import { readTraces } from '../src/robustnessAnalysis'

afterEach(() => {
  // this clears timers, removes global listeners etc
  // I'm not sure if this is 100% safe to do
  // it's not clear if the window  object after this operation is still usable in the same way (is it recyclable?)
  // it does seem to cover our needs so far though
  window.close();
});


const createIframeMock = () => {
  const messages: any = [];

  // if only we wouldn't transpile down to es5 we could wrap this in a custom class extending EventTarget
  // transpiled classes can't extend native classes because they are calling super like this: var _this = _super.call(this) || this;
  // and native classes must be instantiated with new/super
  const iframe = new EventTarget() as HTMLIFrameElement;

  (iframe as any).contentWindow = {
    postMessage(ev) {
      messages.push(ev);
    }
  };

  iframe.setAttribute = () => {};

  return {
    iframe,
    initConnection() {
      iframe.dispatchEvent(new Event('load'));
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'xstate.inspecting'
          }
        })
      );
    },
    flushMessages() {
      const [...flushed] = messages;
      messages.length = 0;
      return flushed;
    }
  };
};

describe('@Robustness Analysis of Varios Models', () => {
  /*
  //=================[1]
  it('should successfully serialize value with unsafe toJSON when serializer manages to replace it', () => {
    const service = interpret(behaviorMachine, {
      devTools: true,
    }).start();
    const devTools = createDevTools();
    const iframeMock = createIframeMock();

    inspect({
      iframe: iframeMock.iframe,
      devTools,
      // serialize(_key, value) {
      //   if (value && typeof value === 'object' && 'unsafe' in value) {
      //     return {
      //       ...value,
      //       unsafe: '[unsafe]'
      //     };
      //   }
      //   return value;
      // }
    });

    iframeMock.initConnection();

    // const service = interpret(machine).start();
    devTools.register(service);

    iframeMock.flushMessages();

    // service.send({
    //   type: 'EV',
      // value: {
      //   unsafe: {
      //     get toJSON() {
      //       throw new Error('oops');
      //     }
      //   }
      // }
    // });
    
    service.send({type:'t1'});

    expect(iframeMock.flushMessages()).toMatchInlineSnapshot(`
      Array [
        Object {
          "event": "{\\"name\\":\\"EV\\",\\"data\\":{\\"type\\":\\"EV\\"},\\"$$type\\":\\"scxml\\",\\"type\\":\\"external\\"}",
          "sessionId": "x:1",
          "type": "service.event",
        },
        Object {
          "sessionId": "x:1",
          "state": "{\\"actions\\":[],\\"activities\\":{},\\"meta\\":{},\\"events\\":[],\\"value\\":{},\\"context\\":{},\\"_event\\":{\\"name\\":\\"EV\\",\\"data\\":{\\"type\\":\\"EV\\"},\\"$$type\\":\\"scxml\\",\\"type\\":\\"external\\"},\\"_sessionid\\":\\"x:1\\",\\"event\\":{\\"type\\":\\"EV\\"},\\"transitions\\":[{\\"event\\":\\"EV\\",\\"actions\\":[],\\"source\\":\\"#(machine)\\",\\"internal\\":true,\\"eventType\\":\\"EV\\"}],\\"children\\":{},\\"done\\":false,\\"tags\\":{},\\"changed\\":false}",
          "type": "service.state",
        },
      ]
    `);
  });

  //=================[2]
  it('should accept a serializer', () => {
    expect.assertions(2);
    const machine = createMachine({
      initial: 'active',
      context: {
        map: new Map(),
        deep: {
          map: new Map()
        }
      },
      states: {
        active: {}
      }
    });

    const devTools = createDevTools();

    inspect({
      iframe: false,
      devTools,
      serialize: (_key, value) => {
        if (value instanceof Map) {
          return 'map';
        }

        return value;
      }
    })?.subscribe((state) => {
      if (state.event.type === 'service.register') {
        expect(JSON.parse(state.event.machine).context).toEqual({
          map: 'map',
          deep: {
            map: 'map'
          }
        });
      }

      if (
        state.event.type === 'service.event' &&
        JSON.parse(state.event.event).name === 'TEST'
      ) {
        expect(JSON.parse(state.event.event).data).toEqual({
          type: 'TEST',
          serialized: 'map',
          deep: {
            serialized: 'map'
          }
        });
      }
    });

    const service = interpret(machine).start();

    devTools.register(service);

    service.send({
      type: 'TEST',
      serialized: new Map(), // test value to serialize
      deep: {
        serialized: new Map()
      }
    });
  });
//=================[3]
*/
window.open = jest.fn()
/*
it('simpleWrongMessage senario', () => {
  const service = interpret(behaviorMachine, {
    devTools: true,
  }).start();
  const devTools = createDevTools();
  devTools.register(service);


  //[1]. Read traces 
  //[2]. Send the message + (non-reproduceable values) to the intepreter of BSM
  service.send({type:'t2'});
  //[3]. Process the output from the interpreter to extract critical values
  inspect({
    iframe: false,
    devTools,
  })?.subscribe((state) => {
    debug("state.event.state:",state.event.state);
    let stateJSON = JSON.parse(state.event.state)
    //debug(stateJSON);
    if (state.event.type === 'service.state') {
      //debug(Object.keys(stateJSON));
      //debug(stateJSON.transitions);
      debug(stateJSON.transitions[0].target);
    }
  });

  //service.send({type:'t3'});
  
  //debug('t3 sent!');

  //[4]. Send the message + values to the interpreter of PSM

  //[5]. Process the outputs comming from PSM
  
  //[6]. Check the result with the expected value
  

});
*/
it('simpleWrongMessage senario', () => {
  const service = interpret(behaviorMachine, {
    devTools: true,
  }).start();
  const devTools = createDevTools();
  const iframeMock = createIframeMock();
  devTools.register(service);
  inspect({iframe: iframeMock.iframe,devTools,});
  iframeMock.initConnection();

  //[1]. Read traces 
  //[2]. Send the message + (non-reproduceable values) to the intepreter of BSM
  service.send({type:'t2'});
  //[3]. Process the output from the interpreter to extract critical values
  let stt = "";
  iframeMock
              .flushMessages()
              .filter((message: any) => message.type === 'service.state')
              .filter((message: any) => stt = message.state);
  // debug(stt);
  let stateJSON = JSON.parse(stt)
  debug(stateJSON.transitions[0].target);
  readTraces();

  //[4]. Send the message + values to the interpreter of PSM

  //[5]. Process the outputs comming from PSM
  
  //[6]. Check the result with the expected value
  // assertEquals(behaviorMachine.getCost(), 1)

  // service.send({type:'t3'});
  // iframeMock.flushMessages()
  //                 .filter((message: any) => message.type === 'service.state')
  //                 .filter((message: any) => stt = message.state);
  // //debug(stt);
  // stateJSON = JSON.parse(stt)
  // debug(stateJSON.transitions[0].target);

  
  // debug(stateJSON.state);


});

})