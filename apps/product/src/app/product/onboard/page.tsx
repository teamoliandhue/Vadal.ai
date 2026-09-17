/* Onboard — joiners in their first 90 days (Operations · managers and People). */
import { Shell } from "../shell";
import { OnboardHub } from "./OnboardHub";

export default function OnboardPage() {
  return (
    <Shell active="Onboard" breadcrumb="Onboard">
      <OnboardHub />
    </Shell>
  );
}
