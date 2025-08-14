import React, {createContext, useContext, useEffect, useState} from "react";
import {commands, ServInfo} from "@/bindings.ts";

const HttpContext = createContext<HttpContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

type HttpContextType = {
  servInfo: ServInfo
  getSrc: (path: string) => string
  getSrcJson: (path: string) => Promise<any>
  getSrcText: (path: string) => Promise<string>
  getSrcBlob: (path: string) => Promise<Blob>
  getSrcBlobUrl: (path: string) => Promise<string>
}

export function HttpServerProvider({children}: Props) {
  const [httpServer, setHttpServer] = useState<HttpContextType|undefined>(undefined);
  const [servInfo, setServInfo] = useState<ServInfo|undefined>(undefined);

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const healthCheck = async (url: string) => {
    for(let i = 0; i < 3; i++) {
      try {
        const res = await fetch(url);
        if (res.status === 200) {
          console.log('ok health check', url);
          return true;
        }
      } catch (e) {
        console.error('retry', i, url);
      }
      await sleep(200);
    }
  }

  useEffect(() => {
    commands.runHttpServer({
      id: "tr-movie-player-http",
      ip: '127.0.0.1',
      port: 0,
      path: '',
    }).then(res => {
      if (res.status === 'ok') {
        setServInfo(res.data);
      }
    });
  }, [])

  useEffect(() => {
    if(servInfo == undefined) return;
    healthCheck(`http://localhost:${servInfo.port}/health`).then(res => {
      if (res) {
        setHttpServer({
          servInfo: servInfo,
          getSrc: (path: string) => `http://localhost:${servInfo.port}/get_file?path=${path}`,
          getSrcJson: async (path: string) => {
            const url = `http://localhost:${servInfo.port}/get_file?path=${path}`;
            return fetch(url)
              .then(res => res.json());
          },
          getSrcText: async (path: string) => {
            const url = `http://localhost:${servInfo.port}/get_file?path=${path}`;
            return fetch(url)
              .then(res => res.text())
          },
          getSrcBlob: async (path: string) => {
            const url = `http://localhost:${servInfo.port}/get_file?path=${path}`;
            return fetch(url)
              .then(res => res.blob());
          },
          getSrcBlobUrl: async (path: string) => {
            const url = `http://localhost:${servInfo.port}/get_file?path=${path}`;
            return fetch(url)
              .then(res => res.blob())
              .then(blob => URL.createObjectURL(blob))
          },
        });
      }
    })
    // const getSrc = (path: string) => `http://localhost:${servInfo.port}/get_file?path=${path}`;
    // const getSrcJson = <T>(path: string) => {
    //   return fetch(getSrc(path)).then(res => {
    //     return res.json() as Promise<T>;
    //   })
    // };
    // const getSrcText = async (path: string): Promise<string> => {
    //   return fetch(getSrc(path)).then(res => res.text());
    // };


  }, [servInfo]);
  return (
    <HttpContext.Provider value={httpServer}>
      {children}
    </HttpContext.Provider>
  );
}

export function useHttp() {
  return useContext(HttpContext);
}



