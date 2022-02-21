import fs from 'fs';
import config from '@/config';

function getMissionsList(resolve, count) {
  const missions = [];
  count++;
  try {
    fs.readdirSync(config.armaMissionsPath).forEach(file => {
      const stats = fs.statSync(path.join(config.armaMissionsPath, file));

      missions.push({
        file,
        size: stats.size,
        lastModified: stats.mtimeMs
      });
    });

    missions.sort((a, b) => b.lastModified - a.lastModified);
    resolve(missions);
  } catch (error) {
    if (count < 2) {
      setTimeout(() => getMissions(resolve, count), 500);
    } else {
      resolve(null);
    }
  }
}

export function getMissions() {
  return new Promise ((resolve) => getMissionsList(resolve, 0));
}
