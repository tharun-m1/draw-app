
import ConnectPage from "./ConnectPage";



async function CanvasPage({ params }: {
  params: {
    roomId: string;
  }
}) {
  const slugId = (await params).roomId;
  return <ConnectPage slugId={slugId} />
}

export default CanvasPage;
