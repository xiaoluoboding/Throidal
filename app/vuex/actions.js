// import * as types from './mutation-types'
// export const setToken = ({ dispatch }, token) => {
//   dispatch(types.SET_TOKEN, token)
// }

// login actions
export const toggleConnecting = makeAction('TOGGLE_CONNECTING')
export const toggleLoading = makeAction('TOGGLE_LOADING')
export const toggleLogin = makeAction('TOGGLE_LOGIN')

// github actions
export const setToken = makeAction('SET_TOKEN')
export const setGithub = makeAction('SET_GITHUB')
export const setUser = makeAction('SET_USER')
export const setRepos = makeAction('SET_REPOS')

// dashboard actions
export const toggleLoadingReadme = makeAction('TOGGLE_LOADING_README')
export const setActiveRepo = makeAction('SET_ACTIVE_REPO')
export const orderRepo = makeAction('ORDER_REPO')

function makeAction (type) {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}
