import {ReactNode} from "react";

export default interface ModuleInterface {

    getTitle(): string;

    getUniqueId(): string;

    getPreviewImage(): string | undefined;

    renderGame(): ReactNode;

}