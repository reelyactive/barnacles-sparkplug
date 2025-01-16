barnacles-sparkplug
===================

__barnacles-sparkplug__ distributes ambient IoT sensor data via MQTT observing the Eclipse Sparkplug specification.

![Overview of barnacles-sparkplug](https://reelyactive.github.io/barnacles-sparkplug/images/overview.png)

__barnacles-sparkplug__ ingests a real-time stream of _dynamb_ objects from [barnacles](https://github.com/reelyactive/barnacles/) which it publishes via MQTT as Sparkplug B payloads.  It couples seamlessly with reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source IoT middleware.

__barnacles-sparkplug__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnacles-sparkplug) that can run on resource-constrained edge devices as well as on powerful cloud servers and anything in between.


Pareto Anywhere integration
---------------------------

A common application of __barnacles-sparkplug__ is to publish IoT data from [pareto-anywhere](https://github.com/reelyactive/pareto-anywhere) as Sparkplug B payloads via MQTT.  Simply follow our [Create a Pareto Anywhere startup script](https://reelyactive.github.io/diy/pareto-anywhere-startup-script/) tutorial using the script below:

```javascript
#!/usr/bin/env node

const ParetoAnywhere = require('../lib/paretoanywhere.js');

// Edit the options to customise the server
const BARNACLES_SPARKPLUG_OPTIONS = {};

// ----- Exit gracefully if the optional dependency is not found -----
let BarnaclesSparkplug;
try {
  BarnaclesSparkplug = require('barnacles-sparkplug');
}
catch(err) {
  console.log('This script requires barnacles-sparkplug.  Install with:');
  console.log('\r\n    "npm install barnacles-sparkplug"\r\n');
  return console.log('and then run this script again.');
}
// -------------------------------------------------------------------

let pa = new ParetoAnywhere();
pa.barnacles.addInterface(BarnaclesSparkplug, BARNACLES_SPARKPLUG_OPTIONS);
```


Quick Start
-----------

Clone this repository, then from its root folder, install dependencies with `npm install`.  Start the Sparkplug client with the following command:

    npm start

If a MQTT broker is running on localhost, the client should connect (without authentication) and publish a NBIRTH message.  For convenience, a script to subscribe to Sparkplug messages (topic: spBv1.0/#) on localhost and print these to the console is provided, and can be started with the following command:

    npm run subscribe

When both programs are run simultaneously, the latter will echo all Sparkplug messages to the console, starting with the NBIRTH message which will have the following format:

    Topic: spBv1.0/iot/NBIRTH/paretoanywhere
    {
      timestamp: Long { low: 1735707600, high: 404, unsigned: true },
      metrics: [],
      seq: Long { low: 0, high: 0, unsigned: true }
    }


Simulated Data
--------------

The following simulated devices/sensors are supported for interface testing.

### Minew S1

To simulate a [Minew S1](https://www.minew.com/product/s1-ble-temperature-and-humidity-sensor/) temperature/humidity sensor, start __barnacles-sparkplug__ with the following command:

    npm run minew-s1

Simulated sensor `c30000000051` will expose the following metrics:

| name              | type   |
|:------------------|:-------|
| temperature       | Double |
| relativeHumidity  | Double |
| batteryPercentage | Double |


Supported dynamb properties
---------------------------

__barnacles-sparkplug__ converts standard [dynamb](https://reelyactive.github.io/diy/cheatsheet/#dynamb) properties into the following Protobuf data types:

| Property          | Data Type          | Conversion                         | 
|:------------------|:-------------------|:-----------------------------------|
| acceleration      | DataSet of Double  | Single-column                      |
| amperage          | Double             | none                               |
| angleOfRotation   | Double             | none                               |
| amperages         | DataSet of Double  | Single-column                      |
| batteryPercentage | Double             | none                               |
| batteryVoltage    | Double             | none                               |
| distance          | Double             | none                               |
| elevation         | Double             | none                               |
| heading           | Double             | none                               |
| heartRate         | Double             | none                               |
| illuminance       | Double             | none                               |
| isButtonPressed   | DataSet of Boolean | Single-column                      |
| isContactDetected | DataSet of Boolean | Single-column                      |
| isHealthy         | Boolean            | none                               |
| isMotionDetected  | DataSet of Boolean | Single-column                      |
| isLiquidDetected  | DataSet of Boolean | Single-column                      |
| levelPercentage   | Double             | none                               |
| magneticField     | DataSet of Double  | Single-column                      |
| numberOfOccupants | UInt32             | none                               |
| passageCounts     | DataSet of UInt32  | Single-column                      |
| pressure          | Double             | none                               |
| pressures         | DataSet of Double  | Single-column                      |
| relativeHumidity  | Double             | none                               |
| speed             | Double             | none                               |
| temperature       | Double             | none                               |
| temperatures      | DataSet of Double  | Single-column                      |
| txCount           | UInt32             | none                               |
| uptime            | UInt32             | none                               |
| voltage           | Double             | none                               |
| voltages          | DataSet of Double  | Single-column                      |


Options
-------

__barnacles-sparkplug__ supports the following options:

| Property    | Default                  | Description                      | 
|:------------|:-------------------------|:---------------------------------|
| url         | "mqtt://localhost"       | Local MQTT broker                |
| groupId     | "iot"                    | See Sparkplug specification      |
| edgeNodeId  | "paretoanywhere"         | See Sparkplug specification      |
| clientId    | "ParetoAnywhereEdgeNode" | Unique id of MQTT client         |
| username    | null                     | Optional for MQTT authentication |
| password    | null                     | Optional for MQTT authentication |
| printErrors | false                    | Print MQTT errors?               |


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2025 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
