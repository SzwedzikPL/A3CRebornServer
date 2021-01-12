
import os from 'os';
import createStore from 'unistore';

import log from '@/log';
import args from '@/args';

const store = createStore({
  server: {
    process: null,
    startTimestamp: 0,
    mode: ""
  },
  headless: {
    process: null,
    startTimestamp: 0,
    mode: ""
  }
});
if (args.debug) {
  store.subscribe(state => log.debug("State updated", state));
}

const processNames = ["server", "headless"];
const isValidProcessName = (processName) => processNames.includes(processName);
const storeInterface = {
  isValidProcessName: isValidProcessName,
  getStatus: () => {
    const state = store.getState();
    const status = {
      packageVersion: PACKAGE_VERSION,
      server: {
        online: state.server.process !== null,
        startTimestamp: state.server.startTimestamp,
        mode: state.server.mode
      },
      headless: {
        online: state.headless.process !== null,
        startTimestamp: state.headless.startTimestamp,
        mode: state.headless.mode
      },
      system: {
        uptime: os.uptime()
      }
    };

    return status;
  },
  updateProcess: (processName, process, mode) => {
    if (!isValidProcessName(processName)) return;
    const update = {};
    update[processName] = {
      process,
      mode: process === null ? "" : mode,
      startTimestamp: process === null ? 0 : Date.now()
    };
    store.setState(update);
  },
  getProcess: processName => {
    if (!isValidProcessName(processName)) return null;
    const state = store.getState();
    return state[processName].process;
  },
  isProcessRunning: processName => {
    if (!isValidProcessName(processName)) return false;
    const state = store.getState();
    return state[processName].process !== null;
  }
}

export default storeInterface;
