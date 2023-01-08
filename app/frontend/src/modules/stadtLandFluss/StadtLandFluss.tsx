import ModuleInterface from "../../framework/modules/ModuleInterface";
import {ReactNode} from "react";
import preview from './preview.png'
import StadtLandFlussGame from "./StadtLandFlussGame";

class StadtLandFluss implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Stadt Land Fluss";
    }

    getUniqueId(): string {
        return "stadtLandFluss";
    }

    renderGame(): ReactNode {
        return (<StadtLandFlussGame/>);
    }

}

const stadtLandFluss = new StadtLandFluss()

export default stadtLandFluss