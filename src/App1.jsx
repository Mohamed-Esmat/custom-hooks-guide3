// import { useState, useEffect } from "react";

import useOnlineStatus2 from "./hooks/useOnlineStatus2";

export default function SaveButton() {
  const isOnline = useOnlineStatus2();
  
  function handleSaveClick() {
    console.log("✅ Progress saved");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <button disabled={!isOnline} onClick={handleSaveClick}>
        {isOnline ? "Save progress" : "Reconnecting..."}
      </button>
      <h1>{isOnline ? "✅ Online" : "❌ Disconnected"}</h1>
    </div>
  );
}
