module.exports = function toTitleCase (str) {
  if (typeof str !== 'string') {
    throw new Error('Cannot convert to title case, input is not a string')
  }

  return `${str.substr(0, 1).toUpperCase()}${str.substr(1)}`
}
