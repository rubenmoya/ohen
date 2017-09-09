const { isArray, isFunction, isObject } = require('./utils');

const DEFAULT_EVENTS = ['add', 'update', 'delete'];
const observed = new Map();
const handlers = new Map();

const requestAnimationFrame = global.requestAnimationFrame
    || global.mozRequestAnimationFrame
    || global.webkitRequestAnimationFrame
    || global.msRequestAnimationFrame
    || (callback => global.setTimeout(callback, 1000 / 60));

const observeObject = (object, callback, events) => {
  let data = observed.get(object);

  if (data) {
    return setHandler(object, data, callback, events);
  }

  data = {
    handlers: new Map(),
    properties: Object.keys(object),
    values: Object.values(object),
  };

  observed.set(object, data);
  setHandler(object, data, callback, events);

  if (observed.size === 1) {
    return requestAnimationFrame(runGlobalLoop);
  }
};

const checkObject = (data, object, except) => {
  if (!data.handlers.size) return;
  const { properties, values } = data;
  const toDelete = properties.slice();

  Object.keys(object).forEach((name, index) => {
    const value = object[name];

    if (properties.includes(name)) {
      const oldValue = values[index];
      toDelete[index] = null;

      // eslint-disable-next-line
      if ((oldValue === value ? oldValue === 0 && 1 / oldValue !== 1 / value : oldValue === oldValue || value === value)) {
        addChangeRecord(object, data, { name, type: 'update', object, oldValue }, except);
        data.values[index] = value;
      }
    } else {
      addChangeRecord(object, data, { name, type: 'add', object }, except);
      properties.push(name);
      values.push(value);
    }
  });

  toDelete.forEach((name, index) => {
    if (name === null) return;
    const oldValue = values[index];
    addChangeRecord(object, data, { name, type: 'delete', object, oldValue }, except);
    data.properties.splice(index, 1);
    data.values.splice(index, 1);
  });
};

const runGlobalLoop = () => {
  if (observed.size) {
    observed.forEach(checkObject);
    handlers.forEach(notifyHandlers);
    requestAnimationFrame(runGlobalLoop);
  }
};

const notifyHandlers = (handlerData, handler) => {
  if (handlerData.changeRecords.length) {
    handler(handlerData.changeRecords);
    handlerData.changeRecords = [];
  }
};

const setHandler = (object, data, handler, events) => {
  const handlerData = handlers.get(handler) || { observed: new Map(), changeRecords: [] };
  handlers.set(handler, handlerData);
  handlerData.observed.set(object, { events, data });
  return data.handlers.set(handler, handlerData);
};

const addChangeRecord = (object, data, changeRecord, except) => {
  data.handlers.forEach(handlerData => {
    const { events } = handlerData.observed.get(object);
    if ((typeof except !== 'string' || events.indexOf(except) === -1) && events.indexOf(changeRecord.type) > -1) {
      handlerData.changeRecords.push(changeRecord);
    }
  });
};

const observe = (object, handler, events) => {
  if (!isObject(object)) {
    throw new TypeError('Ohen.observe cannot observe a non-object.');
  }

  if (!isFunction(handler)) {
    throw new TypeError('Ohen.observe cannot deliver to non-function.');
  }

  if (Object.isFrozen(handler)) {
    throw new TypeError('Ohen.observe cannot deliver to a frozen function object.');
  }

  if (arguments.length > 2 && !isArray(events)) {
    throw new TypeError('Third argument of Ohen.observe must be an array of strings.');
  }

  return observeObject(object, handler, events || DEFAULT_EVENTS);
};

const unobserve = (object, handler) => {
  if (!isObject(object)) {
    throw new TypeError('Ohen.unobserve cannot unobserve a non-object');
  }

  if (typeof handler !== 'function') {
    throw new TypeError('Ohen.unobserve cannot deliver to non-function');
  }

  const handlerData = handlers.get(handler);
  const objectData = handlerData ? handlerData.observed.get(object) : null;

  if (handlerData && objectData) {
    handlerData.observed.forEach((data, obj) => checkObject(data.data, obj));
    requestAnimationFrame(() => notifyHandlers(handlerData, handler));

    handlerData.observed.size === 1 && handlerData.observed.has(object)
      ? handlers.delete(handler)
      : handlerData.observed.delete(object);

    objectData.data.handlers.size === 1
      ? observed.delete(object)
      : objectData.data.handlers.delete(handler);
  }

  return object;
};

module.exports = { observe, unobserve };
