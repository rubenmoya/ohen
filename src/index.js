const { isObject } = require('./utils');

const DEFAULT_EVENTS = ['add', 'update', 'delete'];
const observed = new Map();
const handlers = new Map();

const requestAnimationFrame = global.requestAnimationFrame
    || global.mozRequestAnimationFrame
    || global.webkitRequestAnimationFrame
    || global.msRequestAnimationFrame
    || (callback => global.setTimeout(callback, 1000 / 60));

const observe = (object, handler, events) => {
  let data = observed.get(object);

  if (data) {
    return setHandler(object, data, handler, events);
  }

  data = {
    handlers: new Map(),
    properties: Object.keys(object),
    values: Object.values(object),
  };

  observed.set(object, data);
  setHandler(object, data, handler, events);

  if (observed.size === 1) {
    return requestAnimationFrame(runGlobalLoop);
  }

  return Unobserve;
};

const setHandler = (object, data, handler, events) => {
  const handlerData = handlers.get(handler) || { observed: new Map(), changeRecords: [] };
  handlers.set(handler, handlerData);
  handlerData.observed.set(object, { events, data });
  return data.handlers.set(handler, handlerData);
};

const check = (data, object, except) => {
  if (!data.handlers.size) return;

  const { values } = data;
  const properties = data.properties.slice();
  let propertiesLength = properties.length;

  Object.keys(object).forEach((name) => {
    const index = properties.indexOf(name);
    const value = object[name];

    if (index === -1) {
      addChangeRecord(object, data, { name, type: 'add', object }, except);
      data.properties.push(name);
      values.push(value);
    } else {
      const oldValue = values[index];
      properties[index] = null;
      propertiesLength -= 1;
      if ((oldValue === value ? oldValue === 0 && 1 / oldValue !== 1 / value : oldValue === oldValue || value === value)) { // eslint-disable-line
        addChangeRecord(object, data, {
          name,
          type: 'update',
          object,
          oldValue,
        }, except);
        data.values[index] = value;
      }
    }
  });

  let i = properties.length;
  while (propertiesLength) {
    i -= 1;
    if (properties[i] !== null) {
      addChangeRecord(object, data, {
        name: properties[i],
        type: 'delete',
        object,
        oldValue: values[i],
      }, except);
      data.properties.splice(i, 1);
      data.values.splice(i, 1);
      propertiesLength -= 1;
    }
  }
};

const addChangeRecord = (object, data, changeRecord, except) => {
  data.handlers.forEach((handlerData) => {
    const { events } = handlerData.observed.get(object);
    if ((typeof except !== 'string' || events.indexOf(except) === -1) && events.indexOf(changeRecord.type) > -1) {
      handlerData.changeRecords.push(changeRecord);
    }
  });
};

const notify = (handlerData, handler) => {
  if (handlerData.changeRecords.length) {
    handler(handlerData.changeRecords);
    handlerData.changeRecords = [];
  }
};

const runGlobalLoop = () => {
  if (observed.size) {
    observed.forEach(check);
    handlers.forEach(notify);
    requestAnimationFrame(runGlobalLoop);
  }
};

/*
  @function Object.observe
  @see http://arv.github.io/ecmascript-object-observe/#Object.observe
 */
const Observe = (object, handler, events) => {
  if (!isObject(object)) {
    throw new TypeError('Object.observe cannot observe non-object');
  }
  if (typeof handler !== 'function') {
    throw new TypeError('Object.observe cannot deliver to non-function');
  }
  if (Object.isFrozen && Object.isFrozen(handler)) {
    throw new TypeError('Object.observe cannot deliver to a frozen function object');
  }
  if (arguments.length > 2 && typeof events !== 'object') {
    throw new TypeError('Object.observe cannot use non-object accept list');
  }

  return observe(object, handler, events || DEFAULT_EVENTS);
};

/*
  @function Object.unobserve
  @see http://arv.github.io/ecmascript-object-observe/#Object.unobserve
 */
const Unobserve = (object, handler) => {
  if (!isObject(object)) {
    throw new TypeError('Object.unobserve cannot unobserve non-object');
  }

  if (typeof handler !== 'function') {
    throw new TypeError('Object.unobserve cannot deliver to non-function');
  }

  const handlerData = handlers.get(handler);
  const odata = handlerData.observed.get(object);

  if (handlerData && odata) {
    handlerData.observed.forEach((data, obj) => check(data.data, obj));
    requestAnimationFrame(() => notify(handlerData, handler));

    if (handlerData.observed.size === 1 && handlerData.observed.has(object)) {
      handlers.delete(handler);
    } else {
      handlerData.observed.delete(object);
    }

    if (odata.data.handlers.size === 1) {
      observed.delete(object);
    } else {
      odata.data.handlers.delete(handler);
    }
  }
  return object;
};

export default Observe;
