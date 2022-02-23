import ReactDOMServer from 'react-dom/server'
import { App } from './components/App'

export function render(url, context) {
  return ReactDOMServer.renderToString(
    <>
      <App />
    </>
  )
}
