export {
  inspect,
  createWindowReceiver,
  createWebSocketReceiver,
  createDevTools
} from './browser';
import { readFileSync } from 'fs';
// import { State } from 'xstate';




window.open = jest.fn();


function readTraces(path) {
  const file = readFileSync(path, 'utf-8');
  const traces = file.split('\n');
  return traces;
}

export function getTrace(index) {
  const path = './packages/xstate-inspect/src/traces.txt';
  const traces = readTraces(path);
  return traces[index];
}

export function replay(iframeMock, service, trace) {
  // Process trace into <event,message> structure
  const eventMsg = trace.split(",");
  const event = eventMsg[0];
  console.debug(event);

  // let msg = "";
  // if(eventMsg.length > 1){
  //   msg = eventMsg[1];
  // }
  // TODO: msg need to be added
  service.send({type:event});
  // Process the output from the interpreter to extract critical values
  let stt = "";
  iframeMock
              .flushMessages()
              .filter((message: any) => message.type === 'service.state')
              .filter((message: any) => stt = message.state);
  
  let stateJSON = JSON.parse(stt)

  // TODO: situations where might be more transitions should be handled
  console.debug(stateJSON.transitions[0].target);
  // TODO: extract variables from the configuration
}

//static analysis
export function staticAnalysis(behaviorMachine,propertyMachine) {
  const RCB = extractRC(behaviorMachine);
  const RCP = extractRC(propertyMachine);

  console.debug(RCB);
  console.debug(RCP);

}

let visited = Array();
function extractRC(machine) {
  const machineJSON = JSON.stringify(machine);
  const machineObject = JSON.parse(machineJSON);

  const initState = machineObject.initial;
  const id = machineObject.id;
  
  
  // console.debug("OUTPUT:",initStateOnJsonParsed);
  let RCs = Array({});
  if(!visited.includes(initState)){
    visited.push(initState);
    const initStateOnJson = JSON.stringify(machineObject.states[initState].on);
    const initStateOnJsonParsed = JSON.parse(initStateOnJson);
    xstateCrawler(initStateOnJsonParsed,RCs,id);
  }
  
  showRC(RCs);
  return machineObject;
}

function showRC(RCs){
  for (let x = 0; x < RCs.length-1; x++){
    console.debug("rc[id]: "+  RCs[x].id);
    console.debug("rc[source]: "+  RCs[x].source);
    console.debug("rc[event]: "+  RCs[x].event);
    console.debug("rc[target]: "+  RCs[x].target);
  }
}

// function xstateCrawler(machineObject){
//   const initState = machineObject.initial;
//   const initStateOnJson = JSON.stringify(machineObject.states[initState].on);
//   const initStateOnJsonParsed = JSON.parse(initStateOnJson);
//   console.debug("OUTPUT:",initStateOnJsonParsed);
//   Object.keys(initStateOnJsonParsed).forEach(function(key){
//     console.debug(key + '=>source:' + initStateOnJsonParsed[key][0].source);
//     const trJson = JSON.stringify(initStateOnJsonParsed[key][0]);
//     console.log(key + "==> " + trJson);
//  });
  
 function xstateCrawler(initStateOnJsonParsed, RC, id){
  
  Object.keys(initStateOnJsonParsed).forEach(function(key){
    let source = initStateOnJsonParsed[key][0].source;
    let event  = initStateOnJsonParsed[key][0].event;
    let target = initStateOnJsonParsed[key][0].target;
    RC.push({'id':id, 'source':source, 'event': event, 'target':target });
    // console.debug(key + '=>source:' + initStateOnJsonParsed[key][0].source);
    // const trJson = JSON.stringify(initStateOnJsonParsed[key][0]);
    // console.log(key + "==> " + trJson);
    // console.log(key + "==> parsed: " + JSON.parse(JSON.stringify(initStateOnJsonParsed[key][0])));
  });
 }


  // for (state in machineObject.states) {
  //   if(state.key === initState) {
  //     console.debug("FOUND!");
  //   }
  // const initStateInfo = JSON.stringify(machineObject.initial[initState]);
  // console.debug(initState);
  // console.debug(initStateInfo);

//getRCStepBSM (trace, msg, RCB ,γB)

//getRCStepPSM (γ1.E, msg, RCP ,γP)
