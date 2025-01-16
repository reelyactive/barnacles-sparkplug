/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const sparkplug = require('sparkplug-client');


const DEFAULT_URL = 'mqtt://localhost';
const DEFAULT_GROUP_ID = 'iot';
const DEFAULT_EDGE_NODE_ID = 'paretoanywhere';
const DEFAULT_CLIENT_ID = 'ParetoAnywhereEdgeNode';
const DEFAULT_PRINT_ERRORS = false;
const DEFAULT_DYNAMB_OPTIONS = {};
const DEFAULT_EVENTS_TO_STORE = { dynamb: DEFAULT_DYNAMB_OPTIONS };
const SUPPORTED_EVENTS = [ 'dynamb' ];


/**
 * BarnaclesSparkplug Class
 * Distributes dynamb events via MQTT using Sparkplug B payloads.
 */
class BarnaclesSparkplug {

  /**
   * BarnaclesSparkplug constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.printErrors = options.printErrors || DEFAULT_PRINT_ERRORS;
    this.isClientConnected = false;
    this.birthedDevices = new Map(); // TODO: periodically remove stale devices
    this.eventsToStore = {};
    let eventsToStore = options.eventsToStore || DEFAULT_EVENTS_TO_STORE;

    for(const event in eventsToStore) {
      let isSupportedEvent = SUPPORTED_EVENTS.includes(event);

      if(isSupportedEvent) {
        self.eventsToStore[event] = eventsToStore[event] ||
                                    DEFAULT_EVENTS_TO_STORE[event];
      }
    }

    this.client = createSparkplugClient(this, options.url, options.groupId,
                                        options.edgeNodeId, options.clientId,
                                        options.username, options.password);
  }

  /**
   * Handle an outbound event.
   * @param {String} name The outbound event name.
   * @param {Object} data The outbound event data.
   */
  handleEvent(name, data) {
    let self = this;
    let isEventToStore = self.eventsToStore.hasOwnProperty(name);

    if(isEventToStore) {
      switch(name) {
        case 'dynamb':
          return handleDynamb(self, data);
      }
    }
  }
}


/**
 * Handle the given dynamb by publishing it to MQTT using Sparkplug B.
 * @param {BarnaclesSparkplug} instance The BarnaclesSparkplug instance.
 * @param {Object} dynamb The dynamb data.
 */
function handleDynamb(instance, dynamb) {
  let payload = { timestamp: dynamb.timestamp, metrics: [] };

  for(const property in dynamb) {
    let value = dynamb[property];

    switch(property) {
      // Doubles
      case 'amperage':
      case 'angleOfRotation':
      case 'batteryPercentage':
      case 'batteryVoltage':
      case 'distance':
      case 'elevation':
      case 'heading':
      case 'heartRate':
      case 'illuminance':
      case 'levelPercentage':
      case 'pressure':
      case 'relativeHumidity':
      case 'speed':
      case 'temperature':
      case 'voltage':
        payload.metrics.push({ name: property, value: value, type: "Double" });
        break;
      // Booleans
      case 'isHealthy':
        payload.metrics.push({ name: property, value: value, type: "Boolean" });
        break;
      // DataSets of Boolean
      case 'isButtonPressed':
      case 'isContactDetected':
      case 'isLiquidDetected':
      case 'isMotionDetected':
        if(Array.isArray(value)) {
          let dataSet = {
            numOfColumns: 1,
            types: [ 'Boolean' ],
            columns: [ 'status' ],
            rows: value.map((x) => [ x ])
          };
          payload.metrics.push({ name: property, value: dataSet,
                                 type: "DataSet" });
        }
        break;
      // UInt32s
      case 'numberOfOccupants':
      case 'txCount':
      case 'uptime':
        payload.metrics.push({ name: property, value: value, type: "UInt32" });
        break;
      // DataSets of UInt32
      case 'passageCounts':
        if(Array.isArray(value)) {
          let dataSet = {
            numOfColumns: 1,
            types: [ 'UInt32' ],
            columns: [ 'count' ],
            rows: value.map((x) => [ x ])
          };
          payload.metrics.push({ name: property, value: dataSet,
                                 type: "DataSet" });
        }
        break;
      // DataSets of Double
      case 'acceleration':
      case 'amperages':
      case 'magneticField':
      case 'pressures':
      case 'temperatures':
      case 'voltages':
        if(Array.isArray(value)) {
          let dataSet = {
            numOfColumns: 1,
            types: [ 'Double' ],
            columns: [ 'magnitude' ],
            rows: value.map((x) => [ x ])
          };
          payload.metrics.push({ name: property, value: dataSet,
                                 type: "DataSet" });
        }
        break;
    }
  }

  if(instance.birthedDevices.has(dynamb.deviceId)) {
    instance.client.publishDeviceData(dynamb.deviceId, payload);  // DDATA
  }
  else {
    instance.client.publishDeviceBirth(dynamb.deviceId, payload); // DBIRTH
  }

  instance.birthedDevices.set(dynamb.deviceId, dynamb.timestamp);
}


/**
 * Create the MQTT client.
 * @param {BarnaclesSparkplug} instance The BarnaclesSparkplug instance.
 * @param {String} url The MQTT broker URL.
 * @param {String} groupId The Sparkplug group_id for the MQTT topic.
 * @param {String} edgeNodeId The Sparkplug edge_node_id for the MQTT topic.
 * @param {String} clientId The unique MQTT client id for the edge node.
 * @param {String} username The optional MQTT username for authentication.
 * @param {String} password The optional MQTT password for authentication.
 */
function createSparkplugClient(instance, url, groupId, edgeNodeId,
                               clientId, username, password) {
  let config = {
      serverUrl: url || DEFAULT_URL,
      username: username || null,
      password: password || null,
      groupId: groupId || DEFAULT_GROUP_ID,
      edgeNode: edgeNodeId || DEFAULT_EDGE_NODE_ID,
      clientId: clientId || DEFAULT_CLIENT_ID,
      version: "spBv1.0"
  };

  let client = sparkplug.newClient(config);

  client.on('connect', () => {
    instance.isClientConnected = true;
    console.log('barnacles-sparkplug: connected to MQTT server');
  });
  client.on('birth', () => {
    client.publishNodeBirth({ timestamp: Date.now() });
  });
  client.on('ncmd', (deviceId, payload) => {}); // TODO: handle NCMD?
  client.on('dcmd', (deviceId, payload) => {}); // TODO: handle DCMD?
  client.on('close', () => {
    if(instance.isClientConnected) {
      instance.isClientConnected = false;
      console.log('barnacles-sparkplug: disconnected from MQTT server');
    }
  });
  if(instance.printErrors) {
    client.on('error', (error) => {
      console.log('barnacles-sparkplug: MQTT client error');
      console.log(error);
    });
  }

  return client;
}


module.exports = BarnaclesSparkplug;
