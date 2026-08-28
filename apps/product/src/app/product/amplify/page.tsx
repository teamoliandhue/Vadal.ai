import { Shell } from "../shell";
import { AmplifyHub } from "./AmplifyHub";

export default function AmplifyPage() {
  return (
    <Shell active="Amplify" breadcrumb="Amplify">
      <AmplifyHub />
    </Shell>
  );
}
