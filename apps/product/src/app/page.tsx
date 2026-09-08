/* Root → the production dashboard. Opening the app lands on Home (the employee
   daily workspace). The earlier directions/exploration showcase now lives at /directions. */
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/product/home");
}
