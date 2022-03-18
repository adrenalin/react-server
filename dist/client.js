{
  // Core
  alt: require('./lib/alt'),
  events: require('./lib/event'),
  metadata: require('./lib/metadata'),
  request: require('./lib/request'),

  // Errors
  DefaultError: require('./errors/defaulterror'),
  ErrorBoundary: require('./errors/errorboundary'),
  Forbidden: require('./errors/forbidden'),
  Found: require('./errors/found'),
  InvalidRequest: require('./errors/invalidrequest'),
  NotFound: require('./errors/notfound'),

  // Main component
  Component: require('./lib/component'),
  Widget: require('./widgets'),
  Image: require('./widgets/image'),
  Link: require('./widgets/link'),

  // Alt
  BaseSourceBuilder: require('./data/builder'),
  BaseModelAction: require('./data/basemodel/action'),
  BaseModelStore: require('./data/basemodel/store'),
  BaseListAction: require('./data/baselist/action'),
  BaseListStore: require('./data/baselist/store'),

  ApplicationStore: require('./data/application/store'),
  ErrorStore: require('./data/error/store'),

  LocalesAction: require('./data/locales/action'),
  LocalesSource: require('./data/locales/source'),
  LocalesStore: require('./data/locales/store'),

  NotificationListAction: require('./data/notificationlist/action'),
  NotifiicationListSource: require('./data/notificationlist/source'),
  NotificationListStore: require('./data/locales/store'),

  UserAction: require('./data/user/action'),
  UserSource: require('./data/user/source'),
  UserStore: require('./data/user/store')
}
