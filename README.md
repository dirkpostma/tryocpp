# OCPP Backoffice Experiment

POC of backoffice for charging stations using OCPP.

## Getting started

- run `yarn ts-node ./src/server.ts`

  An OCPP listener (websocket) is started on port 9220.
  A webserver with API is started on port 3000.

- configure charging station backoffice URL to: `https://<ip of development system>:9220/`

## API

Following endpoints are available on `http://localhost:/3000`:

### `GET /`

Check if this API server is up

### `GET /stations`

List registered stations

#### Example

```JSON
[
    {
        "id": "DIRK-2403",
        "meterValues": [],
        "bootNotification": {
            "chargePointVendor": "Alfen BV",
            "chargePointModel": "EVe-dual",
            "chargePointSerialNumber": "ace0240377",
            "chargeBoxSerialNumber": "DIRK-2403",
            "firmwareVersion": "5.8.1-4123"
        },
        "statusNotification": {
            "connectorId": 0,
            "errorCode": "OtherError",
            "info": "Modbus TCP/IP lost, in safe mode max 22.0A",
            "status": "Faulted",
            "timestamp": "2023-04-17T11:22:25Z",
            "vendorErrorCode": "210"
        }
    }
]
```

### `POST /reboot/:id`

Reboot command to station. Note: id is the configured stations name. Not suitable as real id.

### `GET /station/:id/config/:configurationKey`

Fetch value of some configuration key.

#### Example

Request:

`GET http://localhost:3000/station/DIRK-2403/config/DeviceIdentifier`

Response:
```JSON
{
    "configurationKey": [
        {
            "key": "DeviceIdentifier",
            "readonly": true,
            "value": "000c00203539470f37353131"
        }
    ]
}
```
