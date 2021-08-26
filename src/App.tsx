import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { ResetCSS } from '@pancakeswap/uikit'
import SuspenseWithChunkError from 'components/SuspenseWithChunkError'
import PageLoader from 'components/PageLoader'
import Menu from 'components/Menu'
import InfoNav from 'components/InfoNav'
import Home from 'views/Home'
import Pools from 'views/Pools'
import Tokens from 'views/Tokens'
import RedirectInvalidToken from 'views/Tokens/redirects'
import PoolPage from 'views/Pools/PoolPage'
import NotFound from 'views/NotFound'
import GlobalStyle from './style/Global'
import history from './routerHistory'

const App: React.FC = () => {
  return (
    <Router history={history}>
      <ResetCSS />
      <GlobalStyle />
      <Menu>
        <SuspenseWithChunkError fallback={<PageLoader />}>
          <InfoNav />
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/pools" exact>
              <Pools />
            </Route>
            <Route path="/tokens" exact>
              <Tokens />
            </Route>
            <Route exact path={['/tokens/:address', '/token/:address']} component={RedirectInvalidToken} />
            <Route exact path={['/pools/:address', '/pool/:address', '/pair/:address']} component={PoolPage} />
            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </SuspenseWithChunkError>
      </Menu>
    </Router>
  )
}

export default App
