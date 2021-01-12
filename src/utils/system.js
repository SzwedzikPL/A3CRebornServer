
import cpuStats from 'cpu-stats';
import {exec} from 'child_process';

export function getCPUUsage() {
  return new Promise(resolve => {
    cpuStats(1000, function(error, result) {
      resolve((error ? [] : result).map(stats => Math.round(stats.cpu)));
    });
  });
}

function getCurrentNetStats() {
  return new Promise(resolve => {
    exec("netstat -e", (error, stdout) => {
      if (error) return resolve([0,0]);

      const parsed = stdout.trim().split('\n').slice(1).map(line => {
        return line.trim().split(/\s+(?=[\d/])/)
      });

      resolve([
        parseInt(parsed[3][1]),
        parseInt(parsed[3][2])
      ]);
    });
  });
}

export function getNetStats() {
  return new Promise((resolve, reject) => {
    Promise.all([
      getCurrentNetStats(),
      new Promise(statResolve => {
        setTimeout(() => getCurrentNetStats().then(data => statResolve(data)), 1000);
      })
    ]).then(data => {
      const [prev, cur] = data;
      resolve({
        in: Math.round((cur[0] - prev[0]) / 1000),
        out: Math.round((cur[1] - prev[1]) / 1000),
      });
    });
  });
}

export function getDiskUsage() {
  return new Promise((resolve, reject) => {
    exec("wmic logicaldisk get size,freespace,caption", (error, stdout) => {
      if (error) return reject(error);

      const parsed = stdout.trim().split('\n').slice(1).map(line => {
        return line.trim().split(/\s+(?=[\d/])/)
      });

      const disks = [];

      parsed.forEach(data => {
        const size = parseInt(data[2]);
        const freeSpace = parseInt(data[1]);
        if (isNaN(size) || isNaN(freeSpace)) return;
        disks.push({
          label: data[0],
          size: parseInt(size / 1024 / 1024),
          freeSpace: parseInt(freeSpace / 1024 / 1024)
        });
      });

      resolve(disks);
    });
  });
}
