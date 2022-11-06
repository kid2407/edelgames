import RouteHandlerInterface from "../../kernel/RouteHandlerInterface";
import Response from "../../kernel/Response";


export class IndexRouteHandler implements RouteHandlerInterface {

    constructor() {
        // we need the constructor to allow typescript to differentiate between objects and classes
    }

    handleRequest(request:object) : Response {

        let response = new Response();
        response.setResponseText('Helloworld');
        return response;
    }


}