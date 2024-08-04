import { utilities } from 'nest-winston';
import { createLogger, format, transports } from 'winston';

const options = {
  file: {
    filename: 'logs/error.log',
    level: 'error'
  },
  console: {
    level: 'silly'
  }
};

// for development environment
const devLogger = {
  format: format.combine(
    format.timestamp(),
    format.ms(),
    utilities.format.nestLike('dncmd', {
      colors: true,
      prettyPrint: true
    })
  ),
  transports: [new transports.Console(options.console)]
};

// for production environment
const prodLogger = {
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File(options.file),
    new transports.File({
      filename: 'logs/combine.log',
      level: 'info'
    })
  ]
};

// export log instance based on the current environment
const instanceLogger =
  process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

export const instance = createLogger(instanceLogger);
