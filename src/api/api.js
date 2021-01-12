
import path from 'path';
import fs from 'fs';
import axios from 'axios';

import args from '@/args';
import log from '@/log';
import config from '@/config';

const axiosInstance = axios.create({
  timeout: 2000
});

const api = {
  downloadMission: (fileName) => {
    return new Promise((resolve, reject) => {
      const filePath = path.join(config.armaMissionsPath, fileName);
      const fileUrl = config.missionsURL + "/" + fileName;
      const writer = fs.createWriteStream(filePath);

      log.debug("Downloading file", fileUrl, "to", filePath);

      axiosInstance({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream'
      }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', data => {
          resolve(`Misja ${fileName} została pobrana na serwer`);
        });
        writer.on('error', error => {
          log.debug('Mission', fileName, 'write error:', error);
          reject(`Wystąpił błąd podczas pobierania misji: błąd zapisu`);
        });
      }).catch(error => {
        log.debug('downloadMission response error, fileUrl:', fileUrl, 'errorMessage:', error.message);

        if (error.response)
          return reject(`Wystąpił błąd podczas pobierania misji: ${error.response.status} ${error.response.statusText}`);
        if (error.request)
          return reject('Wystąpił błąd podczas pobierania misji: brak odpowiedzi');

        reject(error.message);
      });
    });
  },
  getCommand: (commandId) => {
    return new Promise((resolve, reject) => {
      const url = config.apiURL + '?type=command&id='+ commandId;
      log.debug('Sending API request', url);
      axiosInstance.get(url)
        .then(response => {
          return response.data;
        })
        .catch(error => {
          let errorText = '';
          log.debug('getCommand API error response, commandId:', commandId, 'errorMessage:', error.message);

          if (error.response) {
            errorText = `${error.response.status} ${error.response.statusText}`;
          } else if (error.request) {
            errorText = 'brak odpowiedzi';
          } else {
            errorText = error.message;
          }
          return {success: false, error: errorText};
        })
        .then(data => {
          log.debug('getCommand API parsed commandId:',commandId, 'data:', data);
          if (!data.success) return reject(`Błąd odpowiedzi API: ${data.error}`);
          const commandData = data.data;
          if (commandData.status !== 0) return reject("Komenda została już wykonana");
          resolve(commandData);
        });
    });
  }
};

export default api;
