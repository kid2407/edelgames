import RouteHandlerInterface from "./RouteHandlerInterface";

export class RouteDefinition {

    route : string;
    handler : {new() : RouteHandlerInterface};

    constructor(route: string, handler : {new() : RouteHandlerInterface}) {
        this.route = route;
        this.handler = handler;
    }

    instantiateHandler() : RouteHandlerInterface {
        // we cannot have a constructor signature on interfaces, so ignore this error for now
        // @ts-ignore
        return new this.handler();
    }
}