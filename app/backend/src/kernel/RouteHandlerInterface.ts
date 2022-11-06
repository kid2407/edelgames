import Response from "./Response";

export default interface RouteHandlerInterface {


    handleRequest(request : object) : Response;

}