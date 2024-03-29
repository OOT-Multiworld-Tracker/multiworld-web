import React from 'react'
import app from '../app'
import { KeyManager } from '../AppManagers'
import { Item } from '../classes/Item'
import { GetTranslation } from '../classes/Translator'
import LanguageContext from '../components/LanguageContext'

export default class Items extends React.Component {
  constructor () {
    super()
    this.state = { items: app.local.world.save }

    this.onWorldUpdate = this.onWorldUpdate.bind(this)
  }

  onWorldUpdate () {
    this.setState({ items: app.local.world.save })
  }

  componentDidMount () {
    app.subscribeToWorldUpdate(this.onWorldUpdate)
  }

  componentWillUnmount () {
    app.unsubscribe('world update', this.onWorldUpdate)
  }

  makeGridElement (item, index, showMax = false) {
    return (
      <div key={item.name+index} className={`grid-item${item.Index() > 0 ? " active" : ""}`}
        onClick={() => {item.Toggle(); this.setState({ items: app.local.world.save }); app.call('world update')}}>
          
          <div style={{backgroundImage: `url(${item.Icon()})`}}>
            { item.values.length > 2 && item.Index ( ) > 0 && 
              <span>
                { (typeof item.value != "number") ? item.value.slice ( 0, 1 ) : item.value } 
                { showMax ? " / " + (parseInt(item.values.length) - 1) : "" }
              </span>
            }
          </div>

      </div>
    )
  }

  render () {
    return (
      <div style={{maxWidth: '260px',flexWrap: 'wrap', display:'flex'}}>
      {
        // Turn to item list into an array of values for indexing.
        Object.values(app.local.world.items).map( (item, index) => {
          if (item instanceof KeyManager) {  // Divide the key-managers of the item lists into groups.
            const keyList = [
              <div className='list-header' key={item.name}>
                <span className='location-name'>{ item.name }</span>
                <span className='location-items'>Have</span>
              </div>
            ];

            // After ensuring the key-field is an item, turn it into a grid element.
            Object.values(item).forEach( (key, index) => {
              if (!(key instanceof Item)) return; // The KeyManager includes more than just item values, so truncate those.
              keyList.push(this.makeGridElement(key, index, true)); 
            });
            
            return keyList;
          }

          return this.makeGridElement(item, index);
        })
      }
      </div>
    )
  }
}
