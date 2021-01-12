
import chalk from 'chalk';

import args from '@/args';

const log = function() {
  console.log(...arguments);
};

log.error = function() {
  console.error(chalk.redBright('[ERROR]'), ...arguments);
};

log.warn = function() {
  console.warn(chalk.keyword('orange')('[WARNING]'), ...arguments);
};

log.info = function() {
  console.info(chalk.blueBright('[INFO]'), ...arguments);
};

log.debug = !args.debug ? () => {} : function () {
  console.debug(chalk.gray('[DEBUG]'), ...arguments);
};

log.success = function() {
  console.log(chalk.green(...arguments));
};

log.valid = function() {
  console.log(chalk.green('[√]'), ...arguments);
}

log.invalid = function() {
  console.log(chalk.redBright('[X]'), ...arguments);
}

log.configValue = function() {
  console.log("  ", arguments[0], chalk.yellowBright(arguments[1]));
}

log('');
log('   ░█████╗░██████╗░░█████╗░  ░██████╗███████╗██████╗░██╗░░░██╗███████╗██████╗░');
log('   ██╔══██╗╚════██╗██╔══██╗  ██╔════╝██╔════╝██╔══██╗██║░░░██║██╔════╝██╔══██╗');
log('   ███████║░█████╔╝██║░░╚═╝  ╚█████╗░█████╗░░██████╔╝╚██╗░██╔╝█████╗░░██████╔╝');
log('   ██╔══██║░╚═══██╗██║░░██╗  ░╚═══██╗██╔══╝░░██╔══██╗░╚████╔╝░██╔══╝░░██╔══██╗');
log('   ██║░░██║██████╔╝╚█████╔╝  ██████╔╝███████╗██║░░██║░░╚██╔╝░░███████╗██║░░██║');
log('   ╚═╝░░╚═╝╚═════╝░░╚════╝░  ╚═════╝░╚══════╝╚═╝░░╚═╝░░░╚═╝░░░╚══════╝╚═╝░░╚═╝');
log('');
log('                                Version:', chalk.yellowBright(PACKAGE_VERSION));
log('');

if (args.debug) {
  log.warn('Debug mode enabled!\n');
}

export default log
