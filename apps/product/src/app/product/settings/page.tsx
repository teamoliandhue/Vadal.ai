import { Shell } from "../shell";
import { SettingsHub } from "./SettingsHub";

export default function SettingsPage() {
  return (
    <Shell active="Settings" breadcrumb="Settings">
      <SettingsHub />
    </Shell>
  );
}
