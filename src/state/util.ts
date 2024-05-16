import { AuthState } from './auth'

export const authHasLoaded = (state: AuthState) => {
  if (state.error) return true
  if (state.loading) return false
  if (state.access_token || localStorage.getItem('token')) {
    return state.userID !== undefined
  }
  return true
}
