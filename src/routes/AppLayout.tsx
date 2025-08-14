import {Outlet} from "react-router-dom";
import DropFileListener from "@/listeners/DropFileListener.tsx";

function AppLayout () {
  return (
    <>
      <DropFileListener />
      <Outlet />
    </>
  )
}

export default AppLayout;