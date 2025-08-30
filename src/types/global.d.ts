interface CustomNavigator {
  mozSettings: {
    createLock: () => {
      forceClose?: Function;
      set: Function;
      get: (key: string) => Promise<any>;
    };

    onsettingchange: Function;
  };
  mozNfc: {
    ontagfound: Function | null;
    ontaglost: Function | null;
  };
  mozL10n: {
    once: (callback: Function) => void;
    get: (id: string, params?: object) => string;
  };
  mozSetMessageHandler: Function;
}
interface Navigator extends CustomNavigator {}


interface mozNFCTagFoundEvent {
  tag: mozNFCTag
}

interface mozNFCTag {
  techList: Array<string>;
  id: Uint8Array;
  selectTech: Function;
}