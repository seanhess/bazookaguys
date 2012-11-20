declare interface IMixpanel {
  track(event:string, info?:any);
  identify(userId:string);
}

declare var mixpanel:IMixpanel;
