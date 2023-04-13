import {
  OcppServer,
  OcppClientConnection,
  BootNotificationRequest,
  BootNotificationResponse,
  HeartbeatRequest,
  HeartbeatResponse,
  StatusNotificationRequest,
  StatusNotificationResponse,
  MeterValuesRequest,
  MeterValuesResponse,
} from "ocpp-ts";

import express from "express";
import { Station, StationsDatabase } from "./StationsDatabase";

const centralSystemSimple = new OcppServer();
centralSystemSimple.listen(9220);
console.log(`Server started, listening on port 9220...`);

const stations = new StationsDatabase();

centralSystemSimple.on("connection", (client: OcppClientConnection) => {
  console.log(`Client ${client.getCpId()} connection`);
  const id = client.getCpId();

  const newStation: Station = {
    id,
    client,
    meterValues: [],
  };

  stations.createOrUpdateStation(newStation);

  client.on("close", (code: number, reason: Buffer) => {
    stations.removeStation(id);
    console.log(`Client ${id} closed connection`, code, reason.toString());
  });

  client.on(
    "BootNotification",
    (
      request: BootNotificationRequest,
      cb: (response: BootNotificationResponse) => void
    ) => {
      console.log(`Client ${id} BootNotification`, request);

      const station = stations.getStation(id);
      station.bootNotification = request;
      stations.updateStation(station);

      const response: BootNotificationResponse = {
        status: "Accepted",
        currentTime: new Date().toISOString(),
        interval: 20,
      };
      cb(response);
    }
  );

  client.on(
    "Heartbeat",
    (request: HeartbeatRequest, cb: (response: HeartbeatResponse) => void) => {
      console.log(`Client ${id} Heartbeat`, request);

      const station = stations.getStation(id);
      station.lastHeartbeatDate = new Date().toISOString();
      stations.updateStation(station);

      const response: HeartbeatResponse = {
        currentTime: new Date().toISOString(),
      };
      cb(response);
    }
  );

  client.on(
    "MeterValues",
    (
      request: MeterValuesRequest,
      cb: (response: MeterValuesResponse) => void
    ) => {
      console.log(`Client ${id} MeterValues`, request);

      const station = stations.getStation(id);
      station.meterValues.push(request);
      stations.updateStation(station);

      const response: MeterValuesResponse = {};
      cb(response);
    }
  );

  client.on(
    "StatusNotification",
    (
      request: StatusNotificationRequest,
      cb: (response: StatusNotificationResponse) => void
    ) => {
      console.log(`Client ${id} StatusNotification`, request);

      const station = stations.getStation(id);
      station.statusNotification = request;
      stations.updateStation(station);

      const response: StatusNotificationResponse = {};
      cb(response);
    }
  );
});

const reset = async (client: OcppClientConnection) => {
  console.log("Reset - Sending command...");

  try {
    const response = await client.callRequest("Reset", {
      type: "Hard",
    });
    console.log("Reset - response: ", response);
  } catch (err) {
    console.log("Reset - error: ", err);
  }
};

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Dirk's OCPP Server!");
});

app.get("/stations", (req, res) => {
  // remove client object because it's not serializable
  const strippedStations = stations.stations.map((item) => {
    const { client, ...rest } = item;
    return rest;
  });
  res.send(strippedStations);
});

app.get("/reboot/:id", (req, res) => {
  const id = req.params.id;
  console.log(`webserver: incoming request: /reboot/${id}`);

  const station = stations.getStation(id);

  if (station) {
    try {
      reset(station.client);
      res.send(`Reset command was sent to client ${station.id}! 🥳`);
    } catch (err) {
      res.send(`Error while sending Reset command to client ${station.id}! 😕`);
    }
  } else {
    res.send("Reset was not sent, station not found 🤷‍♂️");
  }
});

app.get("/station/:id/config/:key", async (req, res) => {
  const id = req.params.id;
  const key = req.params.key;
  console.log(`webserver: incoming request: /station/${id}/config/${key}`);

  const station = stations.getStation(id);

  if (!station) {
    return res.send("station not found 🤷‍♂️");
  }

  if (!station.client) {
    return res.send("station client not found 🤷‍♂️");
  }

  try {
    const response = await station.client.callRequest("GetConfiguration", {
      key: [key],
    });
    console.log("Test - response: ", response);
    return res.send(response);
  } catch (err) {
    console.log("Test - error: ", err);
  }
});

app.listen(port, () => {
  console.log(`Dirk's OCPP webserver started on on port ${port}`);
});
