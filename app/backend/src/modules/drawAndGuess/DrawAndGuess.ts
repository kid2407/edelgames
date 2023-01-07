import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import DrawAndGuessGame from "./DrawAndGuessGame";
import * as fs from "fs";
import ModuleLogger from "../../framework/modules/ModuleLogger";

/*
 * This singleton is used to register the game to the ModuleList
 */
class DrawAndGuess extends ModuleLogger implements ModuleInterface {

    private wordList: string[] = [];

    constructor() {
        super("drawAndGuess");
    }

    getUniqueId(): string {
        return "drawAndGuess";
    }

    getGameInstance(): ModuleGameInterface {
        return new DrawAndGuessGame();
    }

    getWordList(): string[] {
        if(this.wordList.length) {
            return this.wordList;
        }

        try {
            const fileContent = fs.readFileSync(__dirname+'/Wordlist.txt', 'utf8');
            this.wordList = fileContent.split(/\r?\n/);
            this.wordList = this.wordList.map(line => line.trim().toLowerCase());
            this.wordList = this.wordList.filter((line, index, self) => {
                return line !== '' && self.indexOf(line) === index;
            });
            return this.wordList;
        } catch (err) {
            this.logger.error(err);
        }

        return [];
    }

}

const drawAndGuess = new DrawAndGuess();
export default drawAndGuess;