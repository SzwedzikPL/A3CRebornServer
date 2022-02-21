import fs from 'fs';
import process from 'process';
import path from 'path';
import os from 'os';
import childProcess from 'child_process';
import express from 'express';
import chalk from 'chalk';
import ipUtil from 'ip';

import args from '@/args';
import log from '@/log';
import config from '@/config';
import store from '@/store';
import api from '@/api';
import execCommand from '@/commands';
import {getCPUUsage, getNetStats} from '@/utils/system';

if (config === null) {
  log.error("Config is not loaded, aborting");
  process.exit();
}

Promise.all([
  // Server exec
  new Promise((resolve, reject) => {
    fs.access(
      path.join(config.armaServerInstallPath, config.armaServerExe),
      fs.constants.X_OK,
      error => {
        log[error ? "invalid" : "valid"](`${config.armaServerExe} ${error ? 'is not executable' : 'is executable'}`);
        error ? reject() : resolve();
      }
    );
  }),
  // Headless exec
  new Promise((resolve, reject) => {
    fs.access(
      path.join(config.armaServerInstallPath, config.armaHeadlessExe),
      fs.constants.X_OK,
      error => {
        log[error ? "invalid" : "valid"](config.armaHeadlessExe, error ? 'is not executable' : 'is executable');
        error ? reject() : resolve();
      }
    );
  }),
  // MPMissions writable
  new Promise((resolve, reject) => {
    fs.access(
      config.armaMissionsPath,
      fs.constants.W_OK,
      error => {
        log[error ? "invalid" : "valid"]('MPMissions', error ? 'is not writable' : 'is writable');
        error ? reject() : resolve();
      }
    );
  }),
  // Sys restart bat
  new Promise((resolve, reject) => {
    fs.access(
      config.systemRestartBatPath,
      fs.constants.X_OK,
      error => {
        log[error ? "invalid" : "valid"]('System restart BAT', error ? 'is not executable' : 'is executable');
        error ? reject() : resolve();
      }
    );
  }),
]).then(() => {
  log("");

  const app = express();

  if (args.debug) {
    app.use((req, res, next) => {
      const oldWrite = res.write, oldEnd = res.end;
      let chunks = [];

      res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
      };

      res.end = function (chunk) {
        if (chunk) chunks.push(Buffer.from(chunk));
        const body = Buffer.concat(chunks).toString('utf8');
        log.debug("Request", req.path, body);
        oldEnd.apply(res, arguments);
      };

      next();
    });
  }

  app.use((req, res, next) => {
    let ipAddress = req.ip;

    if(ipUtil.isV6Format(ipAddress) && ~ipAddress.indexOf('::ffff'))
      ipAddress = ipAddress.split('::ffff:')[1];

    if(ipUtil.isV4Format(ipAddress) && ~ipAddress.indexOf(':'))
      ipAddress = ipAddress.split(':')[0];

    if (ipAddress !== config.apiIP) {
      res.status(403);
      res.send("Brak dostępu");
    }

    next();
  });

  app.get('/status', (req, res) => {
    if (res.finished) return;
    res.json(store.getStatus());
  });

  app.get('/missions', (req, res) => {
    if (res.finished) return;
    const missions = [];

    fs.readdirSync(config.armaMissionsPath).forEach(file => {
      const stats = fs.statSync(path.join(config.armaMissionsPath, file));

      missions.push({
        file,
        size: stats.size,
        lastModified: stats.mtimeMs
      });
    });

    missions.sort((a, b) => b.lastModified - a.lastModified);

    res.json(missions);
  });

  app.get('/command/:id', (req, res) => {
    if (res.finished) return;
    const commandId = parseInt(req.params.id);
    if (isNaN(commandId)) return res.json({
      success: false,
      error: "Niepoprawne ID komendy"
    });

    api.getCommand(commandId).then(
      data => execCommand(data.command, data.params)
        .then(message => res.json({success: true, message}))
        .catch(error => res.json({success: false, error}))
    ).catch(error => res.json({success: false, error}));
  });


  app.get('/system', (req, res) => {
    if (res.finished) return;
    Promise.all([getCPUUsage(), getNetStats()]).then(data => {
      res.json({
        uptime: os.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem()
        },
        cpus: data[0],
        net: data[1]
      });
    });
  });

  app.listen(config.webServerPort, () => {
    log('Web handler is ready and listening on port', chalk.yellowBright(config.webServerPort));
    log('');
  });
}).catch(() => {
  log("");
  log.error("Config validation not passed, aborting");
  process.exit();
});
