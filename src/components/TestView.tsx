import {useHttp} from "@/components/HttpServerProvider.tsx";

function TestView() {
  const httpServer = useHttp();
  return (
    <div>
      TestView
      {httpServer?.servInfo.port}
    </div>
  )
}

export default TestView;
