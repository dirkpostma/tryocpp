# OCPP Backoffice Experiment

POC of backoffice for charging stations using OCPP.

## Getting started

- run `yarn ts-node ./src/server.ts`

  An OCPP listener (websocket) is started on port 9220.
  A webserver with API is started on port 3000.

- configure charging station backoffice URL to: `https://<ip of development system>:9220/`

## API

Following endpoints are available:

### `GET /`

Check if this API server is up

### `GET /stations`

List registered stations

### `POST /reboot/<stationId>`

Reboot command to station. Note: id is the configured stations name. Not suitable as real id.

### `GET /station/<stationId>/config/<configKey>`

Fetch value of some configuration key.

Example: `GET http://localhost:3000/station/DIRK-1001/config/DeviceIdentifier`
