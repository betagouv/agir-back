import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SignalEcoWatt } from './signalEcoWatt';

const ACCESS_TOKEN_URL = 'https://digital.iservices.rte-france.com/token/oauth';
const ECOWATT_URL =
  'https://digital.iservices.rte-france.com/open_api/ecowatt/v5/signals';
const CLIENT_ID_SECRET =
  'MDNhZTE2ZGYtNTUyZS00NzVhLWIwM2EtZDhkYmFiNmI5MmY4OmI2ZmUyZGQ5LTE5YTgtNDNhOC04ZjJiLWYwOGYxMDg4MzZiMQ==';

@Injectable()
export class EcoWattConnector {
  private access_token: string;
  constructor() {}

  async getEcoWattSignal(): Promise<SignalEcoWatt> {
    let signal;
    try {
      signal = await this.callEcoWattAPI();
    } catch (error) {
      if (error.message === '401') {
        await this.refreshAccessToken();
      }
      // RETRY
      try {
        signal = await this.callEcoWattAPI();
      } catch {
        // NO CAN DO
        return null;
      }
    }
    return {
      message: signal.data.signals[0].message,
      niveau: signal.data.signals[0].dvalue,
    };
  }

  private async refreshAccessToken(): Promise<void> {
    let response = null;
    try {
      response = await axios.post(ACCESS_TOKEN_URL, '', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${CLIENT_ID_SECRET}`,
        },
      });
    } catch (error) {
      console.log('Erreur à la récupération du token ecowatt');
      console.log(error.message);
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    }
    this.access_token = response.data.access_token;
  }

  private async callEcoWattAPI() {
    let response = null;
    try {
      response = await axios.get(ECOWATT_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.access_token}`,
        },
      });
    } catch (error) {
      console.log('Erreur à la récupération du signal ecowatt');
      console.log(error.message);
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      throw new Error(error.response.status);
    }
    return response;
  }
}
