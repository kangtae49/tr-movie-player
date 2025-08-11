import React, {createContext, useContext, useEffect, useState} from "react";
import {commands, ServInfo} from "@/bindings.ts";

const HttpContext = createContext<HttpContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

type HttpContextType = {
  servInfo: ServInfo;
}

export function HttpServerProvider({children}: Props) {
  const [httpServer, setHttpServer] = useState<HttpContextType|undefined>(undefined);
  useEffect(() => {
    commands.runHttpServer({
      id: "tr-movie-player-http",
      ip: '127.0.0.1',
      port: 0,
      path: '',
    }).then(res => {
      if (res.status === 'ok') {
        const servInfo = res.data;
        setHttpServer({servInfo});
      }
    });
  }, [])
  return (
    <HttpContext.Provider value={httpServer}>
      {children}
    </HttpContext.Provider>
  );
}

export function useHttp() {
  return useContext(HttpContext);
}