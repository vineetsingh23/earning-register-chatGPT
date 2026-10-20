import { useEffect, useState } from "react";
import StationLoginPage from "./stationLoginPage";
import RegisterWorkspace from "./registerWorkspace";
import { defaultStations, type StationRecord } from "../lib/registerTypes";
import { fetchStations } from "../lib/supabaseSync";

const selectedStationStorageKey = "metro-station";
const themeStorageKey = "metro-theme";

// root of the app: dark / light mode, station list and station login
export default function EarningRegisterApp() {
  const [loggedInStationName, setLoggedInStationName] = useState(
    () => localStorage.getItem(selectedStationStorageKey) ?? "",
  );
  const [stations, setStations] = useState<StationRecord[]>(defaultStations);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(themeStorageKey);
    return savedTheme
      ? savedTheme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  useEffect(() => {
    fetchStations()
      .then(
        (fetchedStations) =>
          fetchedStations?.length && setStations(fetchedStations),
      )
      .catch(console.error);
  }, []);

  const loggedInStation = stations.find(
    (station) => station.name === loggedInStationName,
  );
  if (!loggedInStation) {
    return (
      <StationLoginPage
        stations={stations}
        onLogin={(stationName) => {
          localStorage.setItem(selectedStationStorageKey, stationName);
          setLoggedInStationName(stationName);
        }}
      />
    );
  }
  return (
    <RegisterWorkspace
      key={loggedInStation.name}
      station={loggedInStation}
      isDarkMode={isDarkMode}
      onToggleDarkMode={() => setIsDarkMode((previous) => !previous)}
      onLogout={() => {
        localStorage.removeItem(selectedStationStorageKey);
        setLoggedInStationName("");
      }}
    />
  );
}
