import {MutationTree, ActionTree, GetterTree} from 'vuex'
import {RootState} from '@/types'
import {AuthState, Authentication, AuthData} from "@/types/auth";
import axios from "axios";

export default {
  namespaced: false,
  state: {
    userLogin: '',
    isAuthorization: false,           //для интерфейса Vue-проекта
    accessTokenClosure: null,         //для авторизации
  } as AuthState,
  getters: {
    GET_USER_LOGIN: state => state.userLogin,
    GET_IS_AUTHORIZATION: state => state.isAuthorization,
    GET_ACCESS_TOKEN: state => {
      if(state.accessTokenClosure != null)
        return state.accessTokenClosure()
      return null
    }
  } as GetterTree<AuthState, RootState>,
  mutations: {
    SET_AUTH: (state, data: AuthData) => {
      state.userLogin =  data.userLogin
      state.isAuthorization = true
      
      console.log('SET_AUTH - accessToken ==================', data.accessToken)

      function closure(token: string) {     //сохраняем accessToken в замыкании
        return function() {
          return token
        }
      }
      state.accessTokenClosure = closure(data.accessToken)
    },
    LOGOUT: state => {
      state.userLogin = ''
      state.isAuthorization = false
      state.accessTokenClosure = null
    },
  } as MutationTree<AuthState>,
  actions: {
    async TOUCH_ACCOUNT({commit}, {login, password}: Authentication): Promise<AuthData> {    //for LOGIN & create_account concurrently
      return await axios.post('api/authentication', {
        login,
        password
      })                              //обращаемся к API-сервису докера через Nginx (а не напрямую).
        .then(({data}) => {
          commit('SET_AUTH', data)
          return data   //for stupid TS
        })
    },
    LOGOUT({commit}) {
      commit('LOGOUT')
      //удаление токенов
    }
  } as ActionTree<AuthState, RootState>
}





