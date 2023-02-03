import React from 'react'
import app, { SaveUtils } from '../../../app'
import Saves from '../../Saves'
import Items from '../../Items'
import Dungeons from '../../Dungeon'
import Settings from '../../Settings'

import EntranceRandomizer from '../EntranceRandomizer'
import Account from '../Account'

// The renderer side-bar component
export default class SidebarRenderer extends React.Component {
  constructor (props) {
    super(props)
    this.pages = [this.itemPage()];
  }

  componentDidMount () {
    this.pages = [this.itemPage(), this.savePage(), this.settingsPage(), this.homePage(), this.accountPage()]
  }

  renderPage () {
    return this.pages[parseInt(this.props.page)]
  }

  homePage () {
    return (
        <EntranceRandomizer />
    )
  }

  savePage () {
    return (
      <>
        <button className='btn btn-dark' style={{ marginBottom: '4px', width: '100%', backgroundColor: 'rgb(113 47 47)' }} onClick={() => SaveUtils.Reset()}>Start Over</button>
        <br />
        <div className='list'>
          <div className='list-header'>Files <span onClick={this.props.onSave} className='btn btn-default icon icon-plus' /></div>
          <div className='list-content'><Saves saves={this.props.saves} onSaveClick={this.props.onModal} /></div>
        </div>
      </>
    )
  }

  itemPage () {
    return (
      <Items />
    )
  }

  settingsPage () {
    return (
      <>
        <input type='file' id='spoiler' onChange={(e) => this.props.onSpoilerUpload(e)} accept='.json' style={{display: 'none'}} />
        <button className='btn btn-default form-control' style={{width: '100%', borderBottom: '1px solid #555'}} onClick={(e) => $('#spoiler').click()}>Upload Spoiler Log</button>
        <Settings settings={app.global.settings} />
        <hr />
        <Dungeons />
      </>
    )
  }

  accountPage () {
    return (
      <>
        <Account onLogin={this.props.onLogin} />
      </>
    )
  }

  render () {
    return (
        this.renderPage()
    )
  }
}
