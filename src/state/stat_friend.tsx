import { Dispatch, Reducer, createContext, useReducer } from 'react'
import { UserData } from '../service/user'

export type StatFriendState = { friend?: UserData }

export type StatFriendAction = {
  type: 'set'
  payload?: UserData
}

const reducer: Reducer<StatFriendState, StatFriendAction> = (
  _: StatFriendState,
  action: StatFriendAction
) => {
  switch (action.type) {
    case 'set': {
      return { friend: action.payload }
    }
  }
}

const initialState = {}

export const StatFriendContext = createContext<[StatFriendState, Dispatch<StatFriendAction>]>([
  initialState,
  () => null,
])

export const StatFriendProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const [state, dispatch] = useReducer<Reducer<StatFriendState, StatFriendAction>>(
    reducer,
    initialState
  )
  return (
    <StatFriendContext.Provider value={[state, dispatch]}>{children}</StatFriendContext.Provider>
  )
}
