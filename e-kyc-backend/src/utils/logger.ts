import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import winston from 'winston'

const logtail = new Logtail('1jwDjFRXh4ESrzfDPdynAEGV')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new LogtailTransport(logtail)],
})

export default logger
