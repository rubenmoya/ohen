module.exports = {
  isObject: object => (
    object !== null && (typeof object === 'object' || typeof object === 'function')
  ),
};
