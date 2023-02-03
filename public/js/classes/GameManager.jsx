/**
 * @type {Game[]}
 */
const gameConfig = require(`../games/OOT/config.json`);
var selectedGame = null;

class Game {
    constructor(data) {
        /**
         * @type {string}
         */
        this.name = data.name;

        /**
         * @type {Location[]}
         */
        this.locations = data.locations;

        this.scenes = data.scenes;

        this.items = data.items;

        this.settings = data.settings;

        this.mixins = data.mixins;

        this.icon = data.icon;
    }
}

var gameList = [
    new Game({
        name: gameConfig.name, items: gameConfig.items, settings: gameConfig.settings, mixins: gameConfig.mixins,
        locations: require(`../games/OOT/locations.json`) || [],
        scenes: require(`../games/OOT/scenes.json`) || []
    })
];

selectedGame = gameList[0];

export default class GameManager {
    static SetSelectedGame (name) {
        selectedGame = gameList.find(game => game.name === name);

        return this.GetSelectedGame();
    }

    static GetGames () {
        return gameList;
    }

    /**
     * 
     * @returns {Game}
     */
    static GetSelectedGame () {
        return selectedGame;    
    }
}
