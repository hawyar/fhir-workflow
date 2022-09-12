import { newFSM } from './fsm'
import { Task } from 'fhir/r4'
import { task } from './resource'
import EventEmitter from 'events'

const EE = new EventEmitter()

export class Workflow {
  readonly name: string
  readonly createdAt: Date
  fsm: any
  task: Task
  ee: EventEmitter
  constructor (name: string) {
    this.name = name
    this.createdAt = new Date()
    this.fsm = newFSM({
      id: 'task',
      initial: 'draft',
      context: {
        retries: 0
      },
      states: {
        draft: {
          on: {
            READY: 'ready',
            REQUEST: 'requested',
            CANCEL: 'cancelled'
          }
        },
        ready: {
          on: {
            RESOLVE: 'in-progress'
          }
        },
        requested: {
          on: {
            ACCEPT: 'accepted',
            REJECT: 'rejected',
            RECEIVE: 'received'
          }
        },
        received: {
          on: {
            ACCEPT: 'accepted',
            REJECT: 'rejected'
          }
        },
        rejected: {
          on: {
            STOP: 'done'
          }
        },
        accepted: {
          on: {
            RESOLVE: 'in-progress'
          }
        },
        'in-progress': {
          on: {
            HOLD: 'on-hold',
            COMPLETE: 'completed',
            FAILED: 'failed'
          }
        },
        completed: {
          on: {
            STOP: 'done'
          }
        },
        failed: {
          on: {
            STOP: 'done'
          }
        },
        'on-hold': {
          on: {
            UNHOLD: 'in-progress'
          }
        },
        cancelled: {
          on: {
            STOP: 'done'
          }
        },
        done: {
          type: 'final'
        }
      }
    })

    this.task = task({
      intent: 'unknown',
      status: 'draft'
    })
    this.ee = EE
  }

  start (): void {
    this.ee.emit("start", this)
    this.fsm.start()
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.ee.on(event, listener)
  }
}

export function workflow (name: string) {
  if (name === undefined || name === '') {
    name = 'my-workflow'
  }
  return new Workflow(name)
}
