import { Appointment, AppointmentResponse, Encounter, Schedule, Slot} from "fhir/r4";
import crypto from "crypto";
import { FSM } from "./fsm";

export class AppointmentWorkflow {
  private name: string
  private id: string
  private appointment: Appointment | null = null
  private slot: Slot | null = null
  private response: AppointmentResponse | null = null
  private encounter: Encounter | null = null
  readonly createdAt: Date
  readonly updatedAt: Date
  fsm: FSM
  constructor (name: string) {
    this.name = name
    this.id = crypto.randomBytes(16).toString('hex')
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.slot = null
    this.appointment = null
    this.response = null
    this.encounter = null
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
          entry: ['createSchedule'],
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
          entry: ['requestAppointment','processRequest'],
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
        createSchedule: (context: any, event: any) => {
          const schedule: Schedule = {
            id: crypto.randomBytes(16).toString('hex'),
            actor: [{ reference: `Practitioner/123` }],
            resourceType: 'Schedule'
          }

          const slot: Slot = {
            id: crypto.randomBytes(6).toString("hex"),
            resourceType: 'Slot',
            status: 'free',
            end: "",
            schedule: {
                reference: `Schedule/${schedule.id}`
            },
            start: '2021-01-01T09:00:00Z'
          }
          context.slot = slot
        },
        requestAppointment: (context: any, event: any) => {
            const appointment: Appointment = {
              participant: [{ status: 'accepted', actor: { reference: `Patient/${crypto.randomBytes(6).toString("hex")}` } }],
              resourceType: 'Appointment',
              status: 'proposed',
              slot: [{ reference: `Slot/${context.slot.id}` }]
            }
            appointment.status = 'pending'
            context.appointment = appointment
        },
        processRequest: (context: any, event: any) => {
          context.slot.status = "busy-tentative"
        },
      }
    })
  }
}

export function scheduleAppointment(name: string): void {
  const workflow = new AppointmentWorkflow(name)
  console.log(workflow)
  // const current = workflow.fsm.service
  // current.start()
  // current.send('REQUEST')
}
