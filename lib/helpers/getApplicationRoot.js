/**
 * Get application root
 *
 * @param { object } options          Options
 * @return { string }                 Application root
 */
module.exports = function getApplicationRoot (options = {}) {
  if (options.applicationRoot) {
    return options.applicationRoot
  }

  return process.cwd()
}
