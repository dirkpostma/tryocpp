import {
  BootNotificationRequest,
  MeterValuesRequest,
  OcppClientConnection,
  StatusNotificationRequest,
} from "ocpp-ts";

export type Station = {
  id: string;
  client: OcppClientConnection;
  bootNotification?: BootNotificationRequest;
  lastHeartbeatDate?: string;
  statusNotification?: StatusNotificationRequest;
  meterValues: MeterValuesRequest[];
};

export class StationsDatabase {
  public stations: Station[] = [];

  public getStation = (id: string) => {
    return this.stations.find((item) => item.id === id);
  };

  public createOrUpdateStation = (newStation: Station) => {
    const existingStation = this.getStation(newStation.id);

    if (!existingStation) {
      this.stations.push(newStation);
    } else {
      this.updateStation(newStation);
    }
  };

  public updateStation = (station: Station) => {
    this.stations = this.stations.map((item) => {
      if (item.id === station.id) {
        return station;
      }
      return item;
    });
  };

  public removeStation = (id: string) => {
    this.stations = this.stations.filter((item) => {
      return item.id !== id;
    });
  };
}
