import { Task as TaskResource } from 'fhir/r4'

class Task implements TaskResource {
  readonly resourceType: TaskResource['resourceType']
  resource: TaskResource
  intent: TaskResource['intent']
  status: TaskResource['status']
  createdAt: Date

  constructor (p?: Omit<TaskResource, 'resourceType'>) {
    this.resourceType = 'Task'
    this.resource = {
      intent: 'unknown',
      status: 'draft',
      resourceType: this.resourceType,
      ...p
    }
    this.createdAt = new Date()
    this.intent = 'unknown'
    this.status = 'draft'
  }
}

export function task (task?: Omit<TaskResource, 'resourceType'>) {
  return new Task(task)
}
