
import ConnectPage from "./ConnectPage";

async function CanvasPage({ params }: any) {
  const slugId = (await params)?.roomId;
  return <ConnectPage slugId={slugId} />
}

export default CanvasPage;
