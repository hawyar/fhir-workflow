import { createMachine, interpret } from "xstate";

export class FSM {
    machine: any;
    service: any;
    constructor (config: any, actions: any) {
      this.machine = createMachine({
        predictableActionArguments: true,
        id: 'fsm',
        strict: true,
        ...config
      }, actions);
      this.service = interpret(this.machine)
    }
  }