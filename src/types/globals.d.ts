declare global {
  interface Window {
    AID?: any;
    APDU?: any;
    reader?: any;
    testSession?: any;
    testChannel?: any;
  }

  // Webpack injects process.env at build time
  var process: {
    env: {
      NODE_ENV: "development" | "production";
    };
  };
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

  interface MozL10n {
    /** Current language info */
    language: {
      code: string;
      direction?: "ltr" | "rtl";
      name?: string;
      /** Set language code (readonly in API, but present) */
    };
    /** Context object for advanced localization */
    ctx: {
      requestLocales: (locale: string | string[]) => void;
      addEventListener: (type: string, listener: Function) => void;
      removeEventListener: (type: string, listener: Function) => void;
      ready: (callback: Function) => void;
      once: (callback: Function) => void;
      formatValue: (id: string, args?: object) => string;
      formatEntity: (id: string, args?: object) => any;
      get: (id: string, args?: object) => string;
      getEntity: (id: string, args?: object) => any;
      getLocale: (code: string) => any;
      registerLocales: (defLocale: string, available: string[]) => void;
      supportedLocales?: string[];
    };
    /** Get a localized string by id */
    get: (id: string, ctxdata?: object) => string;
    /** Format a value with parameters */
    formatValue: (id: string, ctxdata?: object) => string;
    /** Format an entity (returns value and attributes) */
    formatEntity: (id: string, ctxdata?: object) => any;
    /** Translate a DOM fragment */
    translateFragment: (fragment: Node) => void;
    /** Set l10n attributes on an element */
    setAttributes: (element: Element, id: string, args?: object) => void;
    /** Get l10n attributes from an element */
    getAttributes: (element: Element) => { id: string; args?: object };
    /** Add a ready callback */
    ready: (callback: Function) => void;
    /** Add a one-time ready callback */
    once: (callback: Function) => void;
    /** Pseudolocales */
    qps: Record<string, any>;
    /** Internal config */
    _config: {
      appVersion: string | null;
      localeSources: Record<string, any>;
      isPretranslated: boolean;
    };
    /** Internal API getter */
    _getInternalAPI: () => any;
    /** Other internal/legacy properties as needed */
    [key: string]: any;
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
    mozL10n: MozL10n;
    mozSetMessageHandler: Function;
    seManager?: any;
  }
  interface Navigator extends CustomNavigator {}
}

export {};
