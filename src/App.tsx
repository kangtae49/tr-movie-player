import "./App.css";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AppLayout from "./routes/AppLayout.tsx";
import ErrorView from "./routes/ErrorView.tsx";
import MainView from "./routes/MainView.tsx";
import {useHttp} from "@/components/HttpServerProvider.tsx";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorView />,
    children: [
      {
        index: true,
        element: <MainView />,
      },
      {
        path: '/movie-player',
        element: <MainView />,
      },
    ]
  },
]);

function App() {
  const httpServer = useHttp();
  if (httpServer === undefined) return (<div>Loading...</div>)
  return (
    <main className="container">
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
