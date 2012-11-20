declare interface IMixpanel {
  track(event:string, info?:any);
  identify(userId:string);
  name_tag(name:string);
  people: {
    set(info:any);
    identify(userId:string);
  };
}

declare var mixpanel:IMixpanel;
