import React from 'react'
import ReactDOM from 'react-dom'
import UserUpdater from 'state/user/updater'
import ProtocolUpdater from 'state/protocol/updater'
import TokenUpdater from 'state/tokens/updater'
import PoolUpdater from 'state/pools/updater'
import App from './App'
import Providers from './Providers'

function Updaters() {
  return (
    <>
      <UserUpdater />
      <ProtocolUpdater />
      <TokenUpdater />
      <PoolUpdater />
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Providers>
      <Updaters />
      <App />
    </Providers>
  </React.StrictMode>,
  document.getElementById('root'),
)
