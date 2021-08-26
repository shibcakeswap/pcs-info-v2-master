import React from 'react'
import { ModalProvider } from '@pancakeswap/uikit'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { ApolloProvider } from '@apollo/client/react'
import { ThemeContextProvider } from 'contexts/ThemeContext'
import { LanguageProvider } from 'contexts/Localization'
import { client } from 'config/apolloClient'
import store from 'state'

const Providers: React.FC = ({ children }) => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <HelmetProvider>
          <ThemeContextProvider>
            <LanguageProvider>
              <ModalProvider>{children}</ModalProvider>
            </LanguageProvider>
          </ThemeContextProvider>
        </HelmetProvider>
      </Provider>
    </ApolloProvider>
  )
}

export default Providers
