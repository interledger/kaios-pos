declare global {
  interface Window {
    AID?: any;
    APDU?: any;
    reader?: any;
    testSession?: any;
    testChannel?: any;
  }
  // interface Navigator {
  //   seManager?: any;
  //   mozNfc?: {
  //     ontagfound: ((e: any) => void) | null;
  //     ontaglost: ((e: any) => void) | null;
  //   };
  // }

  interface mozNFCTagFoundEvent {
    tag: mozNFCTag;
  }

  interface mozNFCTag {
    techList: Array<string>;
    id: Uint8Array;
    selectTech: Function;
  }

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
    seManager?: any;
  }
  interface Navigator extends CustomNavigator {}
}

export {};
