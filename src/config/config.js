import fs from 'fs';
import ini from 'ini';
import path from 'path';

import log from '@/log';

function getAppConfig(appDirPath) {
  let config = null;

  const configPath = path.resolve(appDirPath, 'server.ini');

  log.debug('Loading config from path', configPath);

  if (fs.existsSync(configPath)) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf-8');
      config = ini.parse(configFile);
    } catch (err) {
      log.error('Cannot load server.ini');
      log(err);
    }
  } else {
    log.error('Server.ini does not exist.');
    log('Expected path:', configPath);
  }

  if (config === null) return null;

  log('Loaded configuration:');
  log.configValue('Web server port:            ', config.webServerPort);
  log.configValue('Arma 3 Server install path: ', config.armaServerInstallPath);
  log.configValue('Arma 3 Server exe name:     ', config.armaServerExe)
  log.configValue('Arma 3 Headless exe name:   ', config.armaHeadlessExe)
  log.configValue('Web api URL:                ', config.apiURL)
  log.configValue('Web api missions URL:       ', config.missionsURL)
  log.configValue('System restart BAT path:    ', config.systemRestartBatPath)
  log('');

  config.armaMissionsPath = path.join(config.armaServerInstallPath, "MPMissions");

  return config;
}

const config = getAppConfig(__dirname);

export default config;
