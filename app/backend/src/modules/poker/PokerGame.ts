import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";

/*
 * The actual game instance, that controls and manages the game
 */
export default class PokerGame implements ModuleGameInterface {

    private api: ModuleApi;

    onGameInitialize(api: ModuleApi): void {
        this.api = api;

        // Add event listeners you want to listen to here with this.api.getEventApi().addEventHandler()

        this.api.getLogger().debug('Initialized game of advanced memory');
    }

}