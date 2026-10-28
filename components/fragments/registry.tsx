import type { ComponentType } from "react";
import type { FragmentId } from "@/lib/content";
import { BranchCards, SignInGateway, TimelineSpine } from "./paradox";
import { DayDial, SplitFlapSignIn } from "./timetrack";

/** Live fragment implementations, keyed by fragment id. */
export const FRAGMENT_COMPONENTS: Record<FragmentId, ComponentType> = {
  spine: TimelineSpine,
  gateway: SignInGateway,
  divergence: BranchCards,
  flap: SplitFlapSignIn,
  dial: DayDial,
};
