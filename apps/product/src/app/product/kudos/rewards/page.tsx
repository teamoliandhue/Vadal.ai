/* The marketplace moved to its own section. This route stays because the
   digest, the tour, Get Started and the marketing site all link to it — a
   working link is worth more than a tidy one. */
import { redirect } from "next/navigation";

export default function RewardsPage() {
  redirect("/product/marketplace");
}
