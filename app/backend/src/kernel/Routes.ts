import {RouteDefinition} from "./RouteDefinition";
import {IndexRouteHandler} from "../modules/index/IndexRouteHandler";

export const RouteList = [
    new RouteDefinition('/', IndexRouteHandler),
];