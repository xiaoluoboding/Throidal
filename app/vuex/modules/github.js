// vuex/modules/github.js
import {
  SET_TOKEN,
  SET_GITHUB,
  SET_USER,
  INIT_REPOS,
  SET_REPOS,
  SET_LAZY_REPOS,
  SET_LANG_GROUP
} from '../mutation-types'
import { isNull, countBy, sample, xor, size, includes } from 'lodash'
import db from '../../services/db'
import jetpack from 'fs-jetpack'
import { remote } from 'electron'

const userDataDir = remote.app.getPath('userData')

// initial state
const state = {
  token: '',
  github: '',
  user: '',
  repos: [],
  lazyRepos: [],
  langGroup: []
}

// mutations
const mutations = {
  [SET_TOKEN] (state, token) {
    state.token = token
  },

  [SET_GITHUB] (state, github) {
    state.github = github
  },

  [SET_USER] (state, user) {
    db.findOneUser(user.id).then(doc => {
      if (isNull(doc)) {
        // when change user delete all db file
        jetpack.find(userDataDir, {
          matching: ['*.db']
        }).forEach(jetpack.remove)
        db.addUser(user, docs => {
          state.user = docs
        })
      } else {
        db.updateUser(user)
        state.user = user
      }
    })
  },

  [INIT_REPOS] (state, repos) {
    // insert t_repos
    let initRepos = []
    let apiReposArray = []
    for (let i in repos) {
      let t_repo = {
        '_id': repos[i].id,
        'repo_idx': parseInt(i),
        'owner_name': repos[i].full_name.split('\/').shift(),
        'repo_name': repos[i].full_name.split('\/').pop(),
        'description': repos[i].description,
        'stargazers_count': repos[i].stargazers_count,
        'forks_count': repos[i].forks_count,
        'html_url': repos[i].html_url,
        'clone_url': repos[i].clone_url,
        'git_url': repos[i].git_url,
        'downloads_url': repos[i].html_url + '/archive/' + repos[i].default_branch + '.zip',
        'created_at': repos[i].created_at,
        'updated_at': repos[i].updated_at,
        'language': repos[i].language == null ? 'null' : repos[i].language
      }
      initRepos.push(t_repo);
      db.findOneRepo(t_repo._id).then(doc => {
        if (isNull(doc)) {
          db.addRepo(t_repo, docs => {})
        } else {
          db.updateRepo(t_repo)
        }
      })
      apiReposArray.push(repos[i].id)
    }
    console.log('findOneAndUpdate [%d] repos', size(repos))

    // sync repos.db
    let diffRepos = []
    db.fetchAllRepos().then(dbRepos => {
      let dbReposArray = []
      for (let i in dbRepos) {
        dbReposArray.push(dbRepos[i]._id)
      }
      // looking for difference
      diffRepos = xor(apiReposArray, dbReposArray)
      if (size(diffRepos) > 0) {
        for (let diff in diffRepos) {
          if (diffRepos.hasOwnProperty(diff) && includes(dbReposArray, diffRepos[diff])) {
            // remove the difference repos
            db.removeRepo(diffRepos[diff])
          } else {
            //
            console.log(diffRepos[diff])
          }
        }
      }
    })

    // build lang_group
    let countLangs = countBy(initRepos, 'language')

    let langGroup = []

    const waveColors = ['waves-red', 'waves-orange', 'waves-yellow', 'waves-green', 'waves-teal', 'waves-blue', 'waves-purple']

    for (let lang in countLangs) {
      if (countLangs.hasOwnProperty(lang)) {
        let lang_count = {
          '_id': lang,
          'lang': lang,
          'count': countLangs[lang],
          'color': sample(waveColors)
        }
        langGroup.push(lang_count)
        db.findOneLangGroup(lang).then(doc => {
          if (isNull(doc)) {
            db.addLangGroup(lang_count, docs => {})
          } else {
            db.updateLangGroup(lang_count)
          }
        })
      }
    }

    // set lang_group
    state.langGroup = langGroup

    // set init repos
    state.repos = initRepos
  },

  [SET_REPOS] (state, repos) {
    state.repos = repos
  },

  [SET_LAZY_REPOS] (state, lazyRepos) {
    state.lazyRepos = lazyRepos
  },

  [SET_LANG_GROUP] (state, langGroup) {
    state.langGroup = langGroup
  }
}

export default {
  state,
  mutations
}
