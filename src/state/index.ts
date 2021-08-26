import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import pools from './pools/reducer'
import protocol from './protocol/reducer'
import tokens from './tokens/reducer'

const PERSISTED_KEYS: string[] = ['user']

const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: {
    user,
    pools,
    protocol,
    tokens,
  },
  middleware: [...getDefaultMiddleware({ thunk: false, immutableCheck: false }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
