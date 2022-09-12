import { createMachine, interpret } from 'xstate'

class FSM {
  readonly machine
  constructor (config: any) {
    this.machine = createMachine({
      predictableActionArguments: true,
      id: 'fhir-workflow-fsm',
      ...config,
      strict: true
    })
  }
}

export function newFSM (config: any) {
  const fsm = new FSM(config)
  const service = interpret(fsm.machine)
  return service
}
