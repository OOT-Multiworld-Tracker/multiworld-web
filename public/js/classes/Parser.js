import { SettingsManager, Location, LocationManager } from '../AppManagers'
import { GameWorld } from './GameWorld'

const SceneList = [];

export default class Parser {
  static ParseSpoiler (log, app) {
    const spoiler = { }

    spoiler.settings = new SettingsManager(log.settings)
    spoiler.log = log
    spoiler.seed = log[':seed']
    spoiler.worlds = []
    
    if (!log.locations) return spoiler;

    if (spoiler.log.settings.world_count > 1) {
      Object.values(log.locations).forEach((_, index) => {
        spoiler.worlds.push(new GameWorld(app))
      })

      Object.keys(log.locations).forEach((world, windex) => {
        Object.values(log.locations[world]).forEach((locale, index) => {
          if (!spoiler.worlds[windex].locations.Array()[index]) return
          spoiler.worlds[windex].locations.Array()[index].item = locale
        })
      })

      Object.values(log.dungeons).forEach((world, index) => {
        for (let i = 0; i < Object.keys(world).length; i++) {
          spoiler.worlds[index].dungeons[i].mq = world[Object.keys(world)[i]] === 'mq'
        }
      })
    } else {
      spoiler.worlds.push(new GameWorld(app))

      for (let i = 0; i < Object.keys(spoiler.log.dungeons).length; i++) {
        spoiler.worlds[0].dungeons[i].mq = log.dungeons[Object.keys(log.dungeons)[i]] === 'mq'
      }
    }

    return spoiler
  }

  static addLocationID (id, event) {
    if ((!LocationList[id].event || !LocationList[id].event === -1) && event != -1) LocationList[id].event = event
  }

  /**
   * Parse the locations.json into a usable map.
   * @param {LocationManager} manager
   * @returns {Map<Location>}
   */
  static ParseLocations (manager) {
    const locations = new Map()

    require('../locations.json').forEach((locale, index) => {
        const location = Object.assign({}, locale)
        location.id = index
  
        if (location.logic) { location.logic = eval(locale.logic) }
        locations.set(String(index), new Location(manager, location))
    })

    return locations
  }

  static ParseScenes () {
    return require('../scenes.json');
  }
}
