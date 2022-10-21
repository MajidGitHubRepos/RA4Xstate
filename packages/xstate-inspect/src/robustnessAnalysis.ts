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
  OTCost;
  BTCost;
  TTCost;
  acceptableCost;
  static operationDone;

  visited = Array();
  graphBSM = Graph();
  graphPSM = Graph();
  static context = {cost:0};

  setTracePath(path: string) {};
  setModels(p1, p2) {};
  createiframeMockBSM(){};
  testInit(acceptableCost){};
  readTraces(){};
  getNumOfTraces(){};
  getTrace(index){};
  replayBSM(iframeMock, service, trace){};
  replayPSM(iframeMock, service, trace){};
  staticAnalysis(){};
  extractRC (machine, graph){};
  xstateCrawler (machineObject, initStateOnJsonParsed, RCs, id, graph) {};
  getCost(actions){};
  getCostInBTCost = function(actions){};
  ComputeBTCost(actions){};  
}


RobustnessAnalysis.prototype.setTracePath = function (path) {
  this.tracePath = path;
  this.readTraces();
}
RobustnessAnalysis.prototype.setModels = function(p1, p2) {
  this.bsmPath = p1;
  this.psmPath = p2;
  this.operationDone = false;
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

RobustnessAnalysis.prototype.testInit = async function(acceptableCost) {
  // return {cost:1};
  this.acceptableCost = acceptableCost;
  this.OTCost = 0;
  this.BTCost = 0;
  this.TTCost = 0;
  
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
  
  this.context = this.propertyMachine._context;
  console.debug(this.context);
  this.staticAnalysis();
  // console.debug(this.propertyMachine.withConfig);
  // console.debug(this.propertyMachine.options);


  //[0]. Get number of traces
  const numOfTraces = this.getNumOfTraces();
  console.debug(numOfTraces);
  //[1]. Read traces
  for (let x = 0; x < numOfTraces; x++){
    let trace = this.getTrace(0);
    this.replayBSM(this.iframeMockBSM, this.serviceBSM, trace);
    let result = this.replayPSM(this.iframeMockPSM, this.servicePSM, trace);  
    if (result != -1){
      return this.TTCost;
    }
  }
  return -1;
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
      console.debug("------------------HIT BAD STATE------------------");
      //update the cost in context
      const actions =  stateJSON.actions;
      this.OTCost += this.getCost(actions);
      // console.debug(actions);
      this.BTCost = this.ComputeBTCost(psmTrg);
      this.TTCost = this.OTCost + this.BTCost;
      if(this.TTCost > this.acceptableCost){
        return -1;
      }
      // this.context['cost'] = this.TTCost;
      // console.debug(this.context);
      // this.operationDone = true;

    }
    return this.TTCost;
    /*
    let stateJSON = JSON.parse(stt)
    // TODO: situations where might be more transitions should be handled
    console.debug(stateJSON.transitions[0].target);
    // TODO: extract variables from the configuration
    */
}

RobustnessAnalysis.prototype.ComputeBTCost = function(src) {  
  //find  all potential Good target states in the machine
  const allStates = this.propertyMachine.config.states;
  const allStatesKeys = Object.keys(allStates);
  let allGoodStates = Array();
  for (let x = 0; x < allStatesKeys.length; x++){
    // We assume all Good states has a "Good" prefix
    if (allStatesKeys[x].indexOf("Good") !== -1) {
      allGoodStates.push(allStatesKeys[x]);
    }
  }
  if(allGoodStates.length == 0) return;

  //find the best path from all potential targets
  var serialized = this.graphPSM.serialize();
  console.debug(serialized);  
  // console.debug(this.graphPSM.hasCycle());
  // console.debug(this.propertyMachine.states[src].config.on);

  let path = this.graphPSM.shortestPath("#"+this.propertyMachine.id+"."+src,"#"+this.propertyMachine.id+"."+allGoodStates[0]);
  console.debug(path);
  //path: [ '#property.Bad', '#property.X', '#property.Good', weight: 2 ]
  
  //calculate the cost in the path
  for (let x1 = 1; x1 < path.length; x1++){
    let tmpTrg = path[x1].split(".")[1];
    if (tmpTrg == 'Good'){
      break;
    }
    // let xxx = this.propertyMachine.idMap['property.Good'].__cache.on['t2'][0].actions[1];
    // console.debug(xxx);


    let allOutGoingTransitions = this.propertyMachine.idMap[this.propertyMachine.id+'.'+src].__cache.on;
    // console.debug("<<<<<<<-1>>>>>>");
    // console.debug(allOutGoingTransitions);

    //find the right transition
    for (const [key, value] of Object.entries(allOutGoingTransitions)) {
      // console.debug("<<<<<<<0>>>>>>");
      // console.debug(allOutGoingTransitions[key][0].target[0].id);
      // console.debug(tmpTrg.includes(allOutGoingTransitions[key].target)); // true
      if (allOutGoingTransitions[key][0].target[0].id.includes(tmpTrg)){
        // console.debug("<<<<<<<1>>>>>>");
        // console.debug(allOutGoingTransitions[key][0].actions[1]);
        let act = allOutGoingTransitions[key][0].actions;
        this.BTCost += this.getCost(act);
        // console.debug("<<<<<<<2>>>>>>");
        // console.debug(this.BTCost);
        break;
      }
    }
  }

  return this.BTCost;
  // console.debug("BTCOST====>");
  // console.debug(this.BTCost);

}

RobustnessAnalysis.prototype.getCost = function(actions) {  
  for (let x = 0 ; x < actions.length; x++){
    if (!actions[x].type.includes("log")){
      this.context.cost = parseInt(actions[x].type.split(":")[1].split(" }")[0]);
      // console.debug("this.context.cost:"+this.context.cost);
      return this.context.cost;      
    }
  }
}

// RobustnessAnalysis.prototype.getCostInBTCost = function(actions) {  
//   console.debug("In getCostInBTCost");
//   console.debug(actions.length);
//   for (let x = 0 ; x < actions.length; x++){
//     if (!actions[x].includes("log")){
//       console.debug(actions[x]);
//       this.context.cost = parseInt(actions[x].type.split(":")[1].split(" }")[0]);
//       return this.context.cost;      
//     }
//   }
// }



//static analysis
RobustnessAnalysis.prototype.staticAnalysis = function() {  
  const RCB = this.extractRC(this.behaviorMachine, this.graphBSM);
  const RCP = this.extractRC(this.propertyMachine, this.graphPSM);

  // var serialized = this.graphBSM.serialize();
  // console.debug(serialized);
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

  
  //showRC(RCs);
  // var serialized = graph.serialize();
  // console.debug(serialized);
  
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
