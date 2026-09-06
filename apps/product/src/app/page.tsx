/* Root → the overview.

   This used to redirect straight to /product/home, which sits behind AuthGuard,
   so anyone arriving without a session was bounced to a sign-in form. For a
   returning user that is correct; for anyone seeing the product for the first
   time it meant the opening screen showed none of it.

   The overview is the front door now and /product/* is unchanged — one click
   from here enters the real app as whichever role they pick. */
import { Overview } from "./overview/Overview";

export default function RootPage() {
  return <Overview />;
}
