import {RouteList} from "./Routes";


class AppKernel {

    constructor() {}

    applyRoutes(expressApp : any) {

        // register the separate modules as post routes
        for(let route of RouteList) {
            expressApp.post(route.route, this.forgeResponse.bind(this, route));
        }

        // register a fallback post route
        expressApp.post('*', (requestObj : any, responseObj : any) => {
            responseObj.send(JSON.stringify({
                'success': true
            }));
        });

        // register a placeholder get route
        expressApp.get('*', (requestObj : any, responseObj : any) => {
            responseObj.status(403).send(JSON.stringify({
                'success': false
            }));
        });
    }

    /**
     *
     * @param route
     * @param requestObj
     * @param responseObj
     */
    forgeResponse(route : object, requestObj : any, responseObj : any) {
        let result;

        try {
            // get and call routeHandler
            // @ts-ignore
            let routeHandler = route.instantiateHandler();
            result = routeHandler.handleRequest(requestObj);

            responseObj.status(
                result.getStatusCode()
            );


            if(result.getResponseFile()) {
                console.log(result.getResponseFile());
                responseObj.sendFile(result.getResponseFile());
            }
            else {
                responseObj.send(result.getResponseText());
            }
        }
        catch (exception) {
            console.error(exception);
            responseObj.send('An error occurred!!', 500);
        }
    }
}

export default new AppKernel();