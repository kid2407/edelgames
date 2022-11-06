export default class Response {

    responseText : string;
    responseFile : string;
    statusCode : number;

    constructor() {}

    setResponseText(responseText: string) : void {
        this.responseText = responseText;
    }

    getResponseText() : string {
        return this.responseText;
    }

    setResponseFile(responseFile: string) : void {
        this.responseFile = responseFile;
    }

    getResponseFile() : string {
        return this.responseFile;
    }

    setStatusCode(statusCode: number) : void {
        this.statusCode = statusCode;
    }

    getStatusCode() : number {
        return this.statusCode || 200;
    }


}