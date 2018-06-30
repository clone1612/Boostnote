import React from 'react'
import styles from './SnippetTab.styl'
import CSSModules from 'browser/lib/CSSModules'
import dataApi from 'browser/main/lib/dataApi'
import i18n from 'browser/lib/i18n'
import eventEmitter from 'browser/main/lib/eventEmitter'
const { remote } = require('electron')
const { Menu, MenuItem } = remote

class SnippetList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      snippets: []
    }
  }

  componentDidMount () {
    this.reloadSnippetList()
    eventEmitter.on('snippetList:reload', this.reloadSnippetList.bind(this))
  }

  reloadSnippetList () {
    dataApi.fetchSnippet().then(snippets => this.setState({snippets}))
  }

  handleSnippetContextMenu (snippet) {
    const menu = new Menu()
    menu.append(new MenuItem({
      label: i18n.__('Delete snippet'),
      click: () => {
        this.deleteSnippet(snippet)
      }
    }))
    menu.popup({})
  }

  deleteSnippet (snippet) {
    dataApi.deleteSnippet(snippet).then(() => {
      this.reloadSnippetList()
      this.props.onSnippetDeleted(snippet)
    }).catch(err => { throw err })
  }

  handleSnippetClick (snippet) {
    this.props.onSnippetClick(snippet)
  }

  createSnippet () {
    dataApi.createSnippet().then(() => {
      this.reloadSnippetList()
      // scroll to end of list when added new snippet
      const snippetList = document.getElementById('snippets')
      snippetList.scrollTop = snippetList.scrollHeight
    }).catch(err => { throw err })
  }

  render () {
    const { snippets } = this.state
    return (
      <div styleName='snippet-list'>
        <div styleName='group-section'>
          <div styleName='group-section-control'>
            <button styleName='group-control-button' onClick={() => this.createSnippet()}>
              <i className='fa fa-plus' /> {i18n.__('New Snippet')}
            </button>
          </div>
        </div>
        <ul id='snippets' styleName='snippets'>
          {
            snippets.map((snippet) => (
              <li
                styleName='snippet-item'
                key={snippet.id}
                onContextMenu={() => this.handleSnippetContextMenu(snippet)}
                onClick={() => this.handleSnippetClick(snippet)}>
                {snippet.name}
              </li>
            ))
          }
        </ul>
      </div>
    )
  }
}

export default CSSModules(SnippetList, styles)
