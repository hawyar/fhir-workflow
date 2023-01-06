import tap from 'tap'
import { scheduleAppointment } from './dist/workflow.js'

tap.test('new appointment', async t => {
  t.plan(1)
  scheduleAppointment('eye-appointment')
  t.pass('appointment scheduled')
})
