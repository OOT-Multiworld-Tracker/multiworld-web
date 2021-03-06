import { SettingsManager, ItemManager } from './AppManagers'
import { GameWorld } from './classes/GameWorld'
import { NetworkManager } from './classes/NetworkingManager'
import { Subscription } from './classes/Subscription'

class AppSubscriptions extends Subscription {
  constructor () {
    super(['connection', 'world update', 'view', 'settings update', 'locations update', 'entrance update', 'account'])
  }

  subscribeToClientConnection (callback) {
    this.subscribe('connection', callback)
  }

  subscribeToWorldUpdate (callback) {
    this.subscribe('world update', callback)
  }

  subscribeToSettingUpdate (callback) {
    this.subscribe('settings update', callback)
  }
}

export class App extends AppSubscriptions {
  constructor () {
    super()

    this.local = {
      world: new GameWorld(this),
      scene: -1
    }

    this.global = {
      settings: new SettingsManager(),
      scene: -1,
      world: 0,
      entrances: []
    }

    this.saveLoad = new Subscription(['save', 'load', 'reset'])

    /**
     * The present electron IPC manager.
     * @type {NetworkManager}
     */
    this.networking = null

    /**
     * The current game world(s).
     * @type {Array[GameWorld]}
     */
    this.worlds = [new GameWorld(this)] // Spawn with a default world instance.
    this.local.world = this.worlds[0]

    this.lastChestID = -1
  }
}

const app = new App()

setTimeout(() => {
  if (localStorage.getItem('autosave') != null) {
    SaveUtils.Load('autosave')
  }
}, 1000)

function Autosave () {
  SaveUtils.Save('autosave')
}

setInterval(Autosave, 10000)

export class SaveUtils {
  static migrate () {
    const saves = []
    Object.entries(localStorage).forEach(([key, value]) => {
      saves.push({name: key, data: JSON.parse(value)})
    })
    localStorage.clear();
    localStorage.saves = JSON.stringify(saves)
  }
  /**
   * Returns a key-array of all save files.
   * @returns {String[]}}
   */
  static GetFiles () {
    return localStorage.saves
  }

  static Delete (name) {
    localStorage.removeItem(name)
  }

  static async Reset () {
    app.global.settings = new SettingsManager()
    app.worlds = [new GameWorld(app)]
    app.local.world = app.worlds[0]

    app.saveLoad.call('load')
    app.local.world.call('update')
  }

  /**
   * Save the current game state to localStorage, returns file.
   * @param {*} name
   * @returns {Promise<Object>}
   */
  static async Save (name) {
    return new Promise((resolve, reject) => {
      const saveFiles = app.worlds.map((world) => 
        Object.assign({ }, { // Assign all of the values to the file.
          dungeons: world.dungeons,
          settings: app.global.settings.Serialize(),
          save: world.save,
          locations: world.locations.Array().map((location) => { return { completed: location.completed, item: location.item, display: location.display, name: location.name, preExit: location.preExit, scene: location.scene } }),
          scene: world.scene,
          entrances: app.global.entrances
        })
      )

      try {
        if (!localStorage.saves) localStorage.saves = JSON.stringify([])
        const saves = JSON.parse(localStorage.saves);
        if (saves.find((save) => save.name === name)) {
          const index = saves.indexOf(saves.find((save) => save.name === name))
          saves[index] = { name, data: {world: app.global.world, files: saveFiles} }
        } else {
          saves.push({ name, data: {world: app.global.world, files: saveFiles} })
        }
        localStorage.saves = JSON.stringify(saves)
      } catch (e) { reject(e) }

      app.saveLoad.call('save', saveFiles)
      return resolve(saveFiles)
    })
  }

  /**
   * Loads the tracker back to a save file's state.
   * @param {*} name
   * @returns {Promise<Object>}
   */
  static async Load (name) {
    return new Promise((resolve, reject) => {
      const file = JSON.parse(localStorage.saves).find((save) => save.name === name).data
      if (!file) return reject(new Error('No save file found.'))
      app.worlds = []

      for (let i = 0; i < file.files.length; i++) app.worlds.push(new GameWorld(app))
      
      app.local.world = app.worlds[app.global.world]
      app.global.world = file.world
      app.global.entrances = file.files[0].entrances || []

      file.files.forEach((world, index) => {
        app.global.settings = new SettingsManager(world.settings)
        app.worlds[index].save = world.save
        app.worlds[index].items = new ItemManager(app.worlds[index])
        app.worlds[index].dungeons = world.dungeons
        app.worlds[index].scene = world.scene

        const items = Object.assign({}, // Assign all of the items to the savefile.
          world.save.questStatus,
          world.save.inventory,
          world.save.boots,
          world.save.shields,
          world.save.tunics,
          world.save.swords
        )

        Object.keys(items).forEach((key) => {
          if (app.worlds[index].items[key] === undefined) return // Ignore any keys not within the item manager.
          app.worlds[index].items[key].Set(items[key] * 1)
        })

        world.locations.forEach((location, index2) => {
          if (location.completed) app.worlds[index].locations.locations.get(String(index2)).completed = location.completed
          if (location.item) app.worlds[index].locations.locations.get(String(index2)).item = location.item
          if (location.display) app.worlds[index].locations.locations.get(String(index2)).display = location.display
        })
      })

      app.saveLoad.call('load', file)
      return resolve(file)
    })
  }
}

app.networking = new NetworkManager(app)

export default app
