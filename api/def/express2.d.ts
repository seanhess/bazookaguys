///<reference path="../../public/components/DefinitelyTyped/Definitions/express-3.0.d.ts"/>

// can't be referenced as an internal module
// because it uses the module syntax, I think
import express = module('express')

//function createServer() {
  //return express()
//}

export interface IHandler {
  (req: express.ServerRequest, res:express.ServerResponse):void;
}

export interface ServerApplication extends express.ServerApplication {
  get(name: string): any;
  get(path: string, handler: IHandler ): void;
  get(path: RegExp, handler: IHandler ): void;
  get(path: string, ...callbacks: IHandler[]): void;
  //get(path: string, callbacks: any, callback: () => void ): void;

  post(path: string, handler: IHandler ): void;
  post(path: RegExp, handler: IHandler ): void;
  post(path: string, ...callbacks: IHandler[]): void;
  //post(path: string, callbacks: any, callback: () => void ): void;
}

export interface ServerRequest extends express.ServerRequest {
  session:any;
}
