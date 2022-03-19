module.exports = {
  // Core
  alt: require('./dist/lib/alt'),
  events: require('./dist/lib/events'),
  metadata: require('./dist/lib/metadata'),
  request: require('./dist/lib/request'),

  // Errors
  DefaultError: require('./dist/shared/errors/defaulterror'),
  ErrorBoundary: require('./dist/shared/errors/errorboundary'),
  Forbidden: require('./dist/shared/errors/forbidden'),
  Found: require('./dist/shared/errors/found'),
  InvalidRequest: require('./dist/shared/errors/invalidrequest'),
  NotFound: require('./dist/shared/errors/notfound'),

  // Main component
  Component: require('./dist/lib/component'),
  Widget: require('./dist/widgets'),
  Image: require('./dist/widgets/image'),
  Link: require('./dist/widgets/link'),

  // Alt
  BaseSourceBuilder: require('./dist/data/builder'),
  BaseModelAction: require('./dist/data/basemodel/action'),
  BaseModelStore: require('./dist/data/basemodel/store'),
  BaseListAction: require('./dist/data/baselist/action'),
  BaseListStore: require('./dist/data/baselist/store'),

  ApplicationStore: require('./dist/data/application/store'),
  ErrorStore: require('./dist/data/error/store'),

  LocalesAction: require('./dist/data/locales/action'),
  LocalesSource: require('./dist/data/locales/source'),
  LocalesStore: require('./dist/data/locales/store'),

  NotificationListAction: require('./dist/data/notificationlist/action'),
  NotifiicationListSource: require('./dist/data/notificationlist/source'),
  NotificationListStore: require('./dist/data/locales/store'),

  UserAction: require('./dist/data/user/action'),
  UserSource: require('./dist/data/user/source'),
  UserStore: require('./dist/data/user/store')
}
