module.exports = {
  // Core
  alt: require('./dist/lib/alt'),
  events: require('./dist/lib/events'),
  metadata: require('./dist/lib/metadata'),
  request: require('./dist/lib/request'),

  // Error pages
  DefaultError: require('./dist/shared/errors/defaulterror'),
  ErrorBoundary: require('./dist/shared/errors/errorboundary'),

  // HTTP/1.1 compatible response pages
  Forbidden: require('./dist/shared/response/forbidden'),
  Found: require('./dist/shared/response/found'),
  MovedPermanently: require('./dist/shared/response/movedpermanently'),
  InvalidRequest: require('./dist/shared/response/invalidrequest'),
  NotFound: require('./dist/shared/response/notfound'),

  // Main component
  Application: require('./dist/lib/application'),
  Component: require('./dist/lib/component'),
  Page: require('./dist/lib/page'),
  Widget: require('./dist/lib/widget'),

  Image: require('./dist/widgets/image'),
  Link: require('./dist/widgets/link'),
  Notifications: require('./dist/shared/notifications'),

  // Alt
  createStore: require('./dist/lib/store'),

  ApplicationStore: require('./dist/data/application'),
  ErrorStore: require('./dist/data/error'),
  LocalesStore: require('./dist/data/locales'),
  NotificationsStore: require('./dist/data/notifications'),
  UserStore: require('./dist/data/user')
}
