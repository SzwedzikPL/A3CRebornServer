
import path from 'path';
import fs from 'fs';
import {spawn} from 'child_process';

import log from '@/log';
import store from '@/store';
import config from '@/config';
import api from '@/api';

function start(processName, params) {
  return new Promise((resolve, reject) => {
    if (!params) return reject("Missing params");
    if (!store.isValidProcessName(processName)) return reject("Nieznana nazwa procesu");
    if (store.isProcessRunning(processName)) return reject("Proces jest już uruchomiony");
    if (typeof params.mode !== "string" || !params.mode) return reject("Niepoprawny tryb uruchomienia");
    if (!Array.isArray(params.arguments) || !params.arguments.length) return reject("Niepoprawna lista argumentów");

    const processTitle = processName === "server" ? "Serwer" : "Headless";

    const armaExec = path.join(
      config.armaServerInstallPath,
      processName === "server" ? config.armaServerExe : config.armaHeadlessExe
    );

    log.debug("Launching", armaExec, "with params", params.arguments);
    const armaProcess = spawn(armaExec, params.arguments, {detached: true});

    armaProcess.on('error', error => {
      log.debug("Arma", processName, "process error:", error.message);
    });

    if (!armaProcess.pid)
      return reject(`Uruchomienie ${processTitle.toLowerCase() + "a"} nie powiodło się`);

    armaProcess.on('exit', code => {
      log.debug("Arma", processName, "process closed with code", code);
      store.updateProcess(processName, null);
    });

    store.updateProcess(processName, armaProcess, params.mode);
    resolve(`${processTitle} został uruchmiony w trybie ${params.mode}`);
  });
}

function stop(processName) {
  return new Promise((resolve, reject) => {
    if (!store.isValidProcessName(processName)) return reject("Nieznana nazwa procesu");
    const processTitle = processName === "server" ? "Serwer" : "Headless";
    if (!store.isProcessRunning(processName)) return reject(`${processTitle} jest już uruchomiony`);
    const armaProcess = store.getProcess(processName);

    Promise.race([
      new Promise((armaResolve, armaReject) => {
        armaProcess.on('exit', code => {
          armaResolve(`${processTitle} został zatrzymany`);
        });
        armaProcess.kill();
      }),
      new Promise((armaResolve, armaReject) => {
        setTimeout(() => armaReject(`Zatrzymanie ${processTitle.toLowerCase() + "a"} nie powiodło się (timeout)`), 5000);
      })
    ]).then(resolve).catch(reject);
  });
}

function downloadMission(params) {
  return new Promise((resolve, reject) => {
    if (!params) return reject("Missing params");
    if (typeof params.file !== "string" || !params.file) return reject("Niepoprawna nazwa pliku");

    const filePath = path.resolve(config.armaMissionsPath, params.file);
    const relative = path.relative(config.armaMissionsPath, filePath);

    if (!relative || relative.startsWith('..') || path.isAbsolute(relative))
      return reject("Niepoprawna nazwa pliku");

    api.downloadMission(params.file).then(resolve).catch(reject);
  });
}

function deleteMission(params) {
  return new Promise((resolve, reject) => {
    if (!params) return reject("Missing params");
    if (typeof params.file !== "string" || !params.file) return reject("Niepoprawna nazwa pliku");

    const filePath = path.resolve(config.armaMissionsPath, params.file);
    const relative = path.relative(config.armaMissionsPath, filePath);

    if (!relative || relative.startsWith('..') || path.isAbsolute(relative))
      return reject("Niepoprawna nazwa pliku");

    fs.unlink(filePath, error => {
      if (error) return reject(`Misja ${params.file} nie istnieje lub nie może być usunięta`);
      resolve(`Misja ${params.file} została usunięta`);
    });
  });
}

function restartSystem() {
  return new Promise((resolve, reject) => {
    const batProcess = spawn(config.systemRestartBatPath, [], {detached: true});
    resolve(`Restart systemu został zainicjowany`);
  });
}

const commands = {
  start: params => start("server", params),
  start_hc: params => start("headless", params),
  stop: () => stop("server"),
  stop_hc: () => stop("headless"),
  restart_system: restartSystem,
  download_mission: downloadMission,
  delete_mission: deleteMission
};

function execCommand(command, params) {
  log.debug("execCommand", command, params);
  return new Promise((resolve, reject) => {
    const commandName = command.toLowerCase();
    if (!commands.hasOwnProperty(commandName)) return reject("Nieznana komenda");
    commands[commandName](params).then(result => {
      log.debug(command, "exec success:", result);
      resolve(result);
    }).catch(error => {
      log.debug(command, "exec fail:", error);
      reject(error);
    });
  });
}

export default execCommand;
