
import ConnectPage from "./ConnectPage";

async function CanvasPage({ params }: any) {
  const slugId = params?.roomId;
  return <ConnectPage slugId={slugId} />
}

export default CanvasPage;
