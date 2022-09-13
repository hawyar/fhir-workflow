import { EventEmitter } from 'events';
import { createMachine, interpret } from 'xstate';
import crypto from 'crypto';

class FSM {
  constructor(config, actions) {
    this.machine = void 0;
    this.service = void 0;
    this.machine = createMachine({
      predictableActionArguments: true,
      id: 'fsm',
      strict: true,
      ...config
    }, actions);
    this.service = interpret(this.machine);
  }

}

const ee = new EventEmitter(); // const fsm =  new FSM({
//   id: 'app-workflow',
//   initial: 'draft',
//   context: {
//     appointment: null,
//     slot: null,
//     response: null,
//     encounter: null
//   },
//   states: {
//     draft: {
//       entry: 'createSchedule',
//       on: {
//         READY: 'ready',
//         REQUEST: 'requested',
//         CANCEL: 'cancelled'
//       }
//     },
//     ready: {
//       on: {
//         RESOLVE: 'in-progress'
//       }
//     },
//     requested: {
//       on: {
//         ACCEPT: 'accepted',
//         REJECT: 'rejected',
//         RECEIVE: 'received'
//       }
//     },
//     received: {
//       on: {
//         ACCEPT: 'accepted',
//         REJECT: 'rejected'
//       }
//     },
//     rejected: {
//       on: {
//         STOP: 'done'
//       }
//     },
//     accepted: {
//       on: {
//         RESOLVE: 'in-progress'
//       }
//     },
//     'in-progress': {
//       on: {
//         HOLD: 'on-hold',
//         COMPLETE: 'completed',
//         FAILED: 'failed'
//       }
//     },
//     completed: {
//       on: {
//         STOP: 'done'
//       }
//     },
//     failed: {
//       on: {
//         STOP: 'done'
//       }
//     },
//     'on-hold': {
//       on: {
//         UNHOLD: 'in-progress'
//       }
//     },
//     cancelled: {
//       on: {
//         STOP: 'done'
//       }
//     },
//     done: {
//       type: 'final'
//     }
//   }
// }, {
//   actions: {
//     createSchedule: (context: any, event: any) => {
//       // prepare free slot
//       const slot: Slot = {
//         resourceType: 'Slot',
//         status: 'free',
//         end: "", schedule: undefined,
//         start: '2021-01-01T09:00:00Z'
//       }
//       console.log("schedule is created/published", context, event)
//     }
//   }
// })

class AppointmentWorkflow {
  constructor(name) {
    this.name = void 0;
    this.createdAt = void 0;
    this.hasStarted = false;
    this.appointment = null;
    this.slot = null;
    this.response = null;
    this.encounter = null;
    this.ee = void 0;
    this.fsm = void 0;
    this.name = name;
    this.createdAt = new Date();
    this.hasStarted = false;
    this.slot = null;
    this.appointment = null;
    this.response = null;
    this.encounter = null;
    this.ee = ee;
    this.fsm = new FSM({
      id: 'app-workflow',
      initial: 'draft',
      context: {
        appointment: null,
        slot: null,
        response: null,
        encounter: null
      },
      states: {
        draft: {
          entry: ['createSchedule', 'signal'],
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
          entry: ['requestAppointment', 'processRequest', 'signal'],
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
    }, {
      actions: {
        createSchedule: (context, event) => {
          const schedule = {
            id: crypto.randomBytes(16).toString('hex'),
            actor: [{
              reference: `Practitioner/123`
            }],
            resourceType: 'Schedule'
          };
          const slot = {
            id: crypto.randomBytes(6).toString("hex"),
            resourceType: 'Slot',
            status: 'free',
            end: "",
            schedule: {
              reference: `Schedule/${schedule.id}`
            },
            start: '2021-01-01T09:00:00Z'
          };
          context.slot = slot;
        },
        requestAppointment: (context, event) => {
          const appointment = {
            participant: [{
              status: 'accepted',
              actor: {
                reference: `Patient/${crypto.randomBytes(6).toString("hex")}`
              }
            }],
            resourceType: 'Appointment',
            status: 'proposed',
            slot: [{
              reference: `Slot/${context.slot.id}`
            }]
          };
          appointment.status = 'pending';
          context.appointment = appointment;
        },
        processRequest: (context, event) => {
          context.slot.status = "busy-tentative";
        },

        signal(context, event) {
          ee.emit('ctx', context);
        }

      }
    });
  }

}
function scheduleAppointment(name) {
  const workflow = new AppointmentWorkflow(name || "my-workflow");
  const current = workflow.fsm.service;
  current.start();
  current.send('REQUEST');
}

export { AppointmentWorkflow, scheduleAppointment };
//# sourceMappingURL=workflow.js.map
