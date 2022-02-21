
import os from 'os';
import createStore from 'unistore';

import log from '@/log';
import args from '@/args';

const store = createStore({
  server: {
    process: null,
    startTimestamp: 0,
    mode: "",
    map: ""
  },
  headless: {
    process: null,
    startTimestamp: 0,
    mode: "",
    map: ""
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
        mode: state.server.mode,
        map: state.server.map
      },
      headless: {
        online: state.headless.process !== null,
        startTimestamp: state.headless.startTimestamp,
        mode: state.headless.mode,
        map: state.headless.map
      },
      system: {
        uptime: os.uptime()
      }
    };

    return status;
  },
  updateProcess: (processName, process, mode, map) => {
    if (!isValidProcessName(processName)) return;
    const update = {};
    update[processName] = {
      process,
      mode: process === null ? "" : mode,
      map: process === null ? "" : map,
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
