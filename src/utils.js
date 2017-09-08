module.exports = {
  isArray: array => (
    Array.isArray(array)
  ),

  isFunction: func => (
    typeof func === 'function'
  ),

  isObject: object => (
    object !== null && (typeof object === 'object' || typeof object === 'function')
  ),
};
