import '../style.css'
import {
    createMachine,
    interpret,
    assign,
    send,
    sendParent
} from "xstate";

const pongList = [];
const pingList = [];
let pingCounter = 0;
let pongCounter = 0;



const pongMachine = createMachine({
    initial: 'pong',
    id: 'pong',
    context: {
        pongCount: 1,
    },
    states: {
        pong: {
            on: {
                onPing: {
                    actions: [() => {
                            console.log('Pong')
                        },
                        'sendPong',
                        'updatePongCount',
                    ]
                }
            }
        }
    }
}).withConfig({
    actions: {
        'sendPong': sendParent('onPong', {
            delay: 200
        }),
        'updatePongCount': () => {
            pongList.push({
                x: pongCounter,
                y: duration
            });
            pongCounter++;
            assign({
                pingCount: (context) => context.pongCount + 1,
            });
        }
    }
})


const pingMachine = createMachine({
    initial: 'ping',
    id: 'ping',
    context: {
        pingCount: 1
    },
    states: {
        ping: {
            invoke: {
                id: 'pong',
                src: pongMachine,
            },
            entry: [send({
                type: 'onPing'
            }, {
                to: 'pong',
                delay: 200
            }), () => {
                console.log('Ping')
            }],
            on: {
                onPong: {
                    target: 'ping',
                    actions: [send({
                        type: 'onPing'
                    }), 'updatePingCount']
                }
            }
        }
    }
}).withConfig({
    actions: {
        'updatePingCount': () => {
            pingList.push({
                x: pingCounter,
                y: duration
            });
            assign({
                pingCount: (context) => context.pingCount + 1,
            });
            chart.render();
        }
    }
})

const service1 = interpret(pingMachine).start();
const service2 = interpret(pongMachine).start();

//listen to the events on the service 
// service2.subscribe(state => {
//     console.log(state.context);
// });

window.service1 = service1;
window.service2 = service2;