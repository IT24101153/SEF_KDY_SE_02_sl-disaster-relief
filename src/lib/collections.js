// Firestore collection names. Firestore is case-sensitive, so every read and
// write must go through these constants — mismatched casing silently splits
// data into two collections that never meet.
export const USERS = 'users'
export const REPORTS = 'reports'
export const DISASTER_AREAS = 'disasterAreas'
export const NEWS = 'news'
export const RELIEF_REQUESTS = 'reliefRequests'

export const ROLES = {
  USER: 'user',
  DISASTER_ADMIN: 'disaster_admin',
  NEWS_MANAGER: 'news_manager',
  RELIEF_MANAGER: 'relief_manager',
}

// Where each role lands after signing in.
export const HOME_BY_ROLE = {
  [ROLES.USER]: '/dashboard',
  [ROLES.DISASTER_ADMIN]: '/admin',
  [ROLES.NEWS_MANAGER]: '/news-manager',
  [ROLES.RELIEF_MANAGER]: '/relief-manager',
}
