export {
  inspect,
  createWindowReceiver,
  createWebSocketReceiver,
  createDevTools
} from './browser';
import { createDevTools, inspect } from '../src';
import { readFileSync } from 'fs';
import { interpret } from 'xstate';
var Graph = require("graph-data-structure");


window.open = jest.fn();


 
export class RobustnessAnalysis {
  tracePath = "";
  traces = Array();
  behaviorMachine;
  propertyMachine;
  iframeMockBSM;
  iframeMockPSM;
  serviceBSM;
  servicePSM;
  bsmPath;
  psmPath;

  visited = Array();
  graphBSM = Graph();
  graphPSM = Graph();

  setTracePath(path: string) {};
  setModels(p1, p2) {};
  createiframeMockBSM(){};
  testInit(){};
  readTraces(){};
  getNumOfTraces(){};
  getTrace(index){};
  replayBSM(iframeMock, service, trace){};
  replayPSM(iframeMock, service, trace){};
  staticAnalysis(){};
  extractRC (machine, graph){};
  xstateCrawler (machineObject, initStateOnJsonParsed, RCs, id, graph) {};  
}


RobustnessAnalysis.prototype.setTracePath = function (path) {
  this.tracePath = path;
  this.readTraces();
}
RobustnessAnalysis.prototype.setModels = function(p1, p2) {
  this.bsmPath = p1;
  this.psmPath = p2;
}

RobustnessAnalysis.prototype.createiframeMockBSM = function() {
  const messages: any = [];
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

RobustnessAnalysis.prototype.testInit = async function() {
  const devTools = createDevTools();
  const bsmPath = this.bsmPath;
  const behaviorMachineModule = await import(bsmPath);
  this.behaviorMachine = behaviorMachineModule.behaviorMachine;
  this.serviceBSM = interpret(this.behaviorMachine, {
    devTools: true,
  }).start();
  this.iframeMockBSM = this.createiframeMockBSM();
  devTools.register(this.serviceBSM);
  inspect({iframe: this.iframeMockBSM.iframe,devTools,});
  this.iframeMockBSM.initConnection();

  const psmPath = this.psmPath;
  const propertyMachineModule = await import(psmPath);
  this.propertyMachine = propertyMachineModule.propertyMachine;
  this.servicePSM = interpret(this.propertyMachine, {
    devTools: true,
  }).start();
  this.iframeMockPSM = this.createiframeMockBSM();
  devTools.register(this.servicePSM);
  inspect({iframe: this.iframeMockPSM.iframe,devTools,});
  this.iframeMockPSM.initConnection();
  

  //[0]. Get number of traces
  const numOfTraces = this.getNumOfTraces();
  console.debug(numOfTraces);
  //[1]. Read traces
  for (let x = 0; x < numOfTraces; x++){
    let trace = this.getTrace(0);
    this.replayBSM(this.iframeMockBSM, this.serviceBSM, trace);
    let result = this.replayPSM(this.iframeMockPSM, this.servicePSM, trace);  
    if (!result){
      console.debug("Majid Babaei");
      return;
    } 
  }
}

RobustnessAnalysis.prototype.readTraces = function() {
  const file = readFileSync(this.tracePath, 'utf-8');
  this.traces = file.split('\n');
  return this.traces;
}

RobustnessAnalysis.prototype.getNumOfTraces = function() {
  return this.traces.length;
}

RobustnessAnalysis.prototype.getTrace = function(index) {
  return this.traces[index];
}

RobustnessAnalysis.prototype.replayBSM = function(iframeMock, service, trace) {
  // Process trace into <event,message> structure
  const eventMsg = trace.split(",");
  const event = eventMsg[0];
  //console.debug(event);

  // TODO: msg need to be added
  service.send({ type: event });
  // Process the output from the interpreter to extract critical values
  let stt = "";
  iframeMock
    .flushMessages()
    .filter((message: any) => message.type === 'service.state')
    .filter((message: any) => stt = message.state);
    JSON.parse(stt);
    // console.debug(stateJSON);
    
    /*
    let stateJSON = JSON.parse(stt)
    // TODO: situations where might be more transitions should be handled
    console.debug(stateJSON.transitions[0].target);
    // TODO: extract variables from the configuration
    */
}

RobustnessAnalysis.prototype.replayPSM = function(iframeMock, service, trace) {
  // Process trace into <event,message> structure
  const eventMsg = trace.split(",");
  const event = eventMsg[0];
  //console.debug(event);

  // TODO: msg need to be added
  service.send({ type: event });
  // Process the output from the interpreter to extract critical values
  let stt = "";
  iframeMock
    .flushMessages()
    .filter((message: any) => message.type === 'service.state')
    .filter((message: any) => stt = message.state);
    let stateJSON = JSON.parse(stt);
    const psmTrg = stateJSON.value;
    if (psmTrg.indexOf("Bad") !== -1) {
      console.debug("HIT BAD STATE");
      console.debug("stateJSON: "+ stateJSON);
      //let OTCost = getCost(psmTrg);
      return false;
    }
    /*
    let stateJSON = JSON.parse(stt)
    // TODO: situations where might be more transitions should be handled
    console.debug(stateJSON.transitions[0].target);
    // TODO: extract variables from the configuration
    */
}


//static analysis
RobustnessAnalysis.prototype.staticAnalysis = function() {  
  const RCB = this.extractRC(this.propertyMachine, this.graphBSM);
  const RCP = this.extractRC(this.propertyMachine, this.graphPSM);

  // console.debug(RCB);
  // console.debug(RCP);
}


RobustnessAnalysis.prototype.extractRC = function(machine, graph) {  
  const machineJSON = JSON.stringify(machine);
  const machineObject = JSON.parse(machineJSON);

  const initState = machineObject.initial;
  const id = machineObject.id;

  let RCs = Array({});
  this.visited.push(initState);
  const initStateOnJson = JSON.stringify(machineObject.states[initState].on);
  const initStateOnJsonParsed = JSON.parse(initStateOnJson);
  this.xstateCrawler(machineObject, initStateOnJsonParsed, RCs, id, graph);

  /*
  //showRC(RCs);
  var serialized = graph.serialize();
  console.debug(serialized);
  */
  return machineObject;
}

/*
function showRC(RCs){
  for (let x = 0; x < RCs.length-1; x++){
    console.debug("rc[id]: "+  RCs[x].id);
    console.debug("rc[source]: "+  RCs[x].source);
    console.debug("rc[event]: "+  RCs[x].event);
    console.debug("rc[target]: "+  RCs[x].target);
  }
}
*/


RobustnessAnalysis.prototype.xstateCrawler = function(machineObject, initStateOnJsonParsed, RCs, id, graph) {  
  let source, event, target;
  Object.keys(initStateOnJsonParsed).forEach(function (key) {
    source = initStateOnJsonParsed[key][0].source;
    event = initStateOnJsonParsed[key][0].event;
    target = initStateOnJsonParsed[key][0].target[0];
    const rc = { 'id': id, 'source': source, 'event': event, 'target': target };
    // console.debug(rc);
    RCs.push(rc);

    // console.debug(key + '=>source:' + initStateOnJsonParsed[key][0].source);
    // const trJson = JSON.stringify(initStateOnJsonParsed[key][0]);
    // console.log(key + "==> " + trJson);
    // console.log(key + "==> parsed: " + JSON.parse(JSON.stringify(initStateOnJsonParsed[key][0])));
  });
  if ((!this.visited.includes(target)) && (typeof (target) != 'undefined')) {
    graph.addEdge(source, target);
    this.visited.push(target);
    // console.debug('target: ' + target); 
    const targetArray = target.split('.');
    const targetOnJson = JSON.stringify(machineObject.states[targetArray[1]].on);
    const targetOnJsonParsed = JSON.parse(targetOnJson);
    this.xstateCrawler(machineObject, targetOnJsonParsed, RCs, id, graph);
  }
}

// //OT cost ← getCost(γP , rcb)
// function getCost(psmTrg){

// }

// //BT cost ← computeBTCost(RCB , RCP , rcb, rcp, γB , γP )
// function computeBTCost(){

// }

// export function raRun(){
//   //[0]. Get number of traces
//   const numOfTraces = getNumOfTraces();
//   console.debug(numOfTraces);
//   //[1]. Read traces
//   for (let x = 0; x < numOfTraces; x++){
//     let trace = getTrace(0);
//     replayBSM(iframeMockBSM, serviceBSM, trace);
//     let result = replayPSM(iframeMockPSM, servicePSM, trace);  
//     if (!result){
//       console.debug("Majid Babaei");
//       return;
//     } 
//   }
// }



  // for (state in machineObject.states) {
  //   if(state.key === initState) {
  //     console.debug("FOUND!");
  //   }
  // const initStateInfo = JSON.stringify(machineObject.initial[initState]);
  // console.debug(initState);
  // console.debug(initStateInfo);

//getRCStepBSM (trace, msg, RCB ,γB)

//getRCStepPSM (γ1.E, msg, RCP ,γP)

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
