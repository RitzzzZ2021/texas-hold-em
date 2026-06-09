import { AuthGate } from "@/components/account/AuthGate";
import { GameLobby } from "@/components/game/GameLobby";

export default function Home() {
  return (
    <AuthGate>
      <GameLobby />
    </AuthGate>
  );
}
