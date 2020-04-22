import path from 'path';
import express from 'express';
import childProcess from 'child_process';
import axios from 'axios';

const app = express();
const port = 27015;

let armaServer = null;

app.get('/status', (req, res) => {
  res.json({
    serverOnline: armaServer !== null
  });
});

app.get('/command/:command', (req, res) => {
  if (req.params.command === 'startserver') {
    return res.json({
      error: (armaServer = startServer()) === null
    });
  }
});

app.listen(port, () => {
  console.log('Web server is listening on port', port);
});

function startServer() {
  const armaDir = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Arma 3 Server';
  const armaExec = path.join(armaDir, 'arma3server_x64.exe');

  console.log('Launching arma server', armaExec);
  const armaServerProcess = childProcess.spawn(armaExec, [], {});

  armaServerProcess.on('error', error => {
    console.error('Arma 3 Server process error:', error.message);
  });

  if (!armaServerProcess.pid) {
    console.error('Arma 3 Server launch failed');
    return null;
  }

  console.log('Arma 3 Server launched with pid', armaServerProcess.pid);

  armaServerProcess.on('close', code => {
    console.log('Arma 3 Server closed with code', code);
    armaServer = null;
  });

  return armaServerProcess;
}
