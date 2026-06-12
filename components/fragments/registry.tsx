import type { ComponentType } from "react";
import type { FragmentId } from "@/lib/content";
import { BookingWidget, IdentityCheck, StatusPage } from "./clients";
import {
  BranchCards,
  MultiverseTimeline,
  RealityRibbon,
  SignInGateway,
  TimelineSpine,
} from "./paradox";
import { NotificationPrefs, Onboarding, RosterAdmin } from "./shiftsum";

/** Live fragment implementations, keyed by fragment id. */
export const FRAGMENT_COMPONENTS: Record<FragmentId, ComponentType> = {
  multiverse: MultiverseTimeline,
  spine: TimelineSpine,
  ribbon: RealityRibbon,
  gateway: SignInGateway,
  divergence: BranchCards,
  onboarding: Onboarding,
  notifications: NotificationPrefs,
  admin: RosterAdmin,
  booking: BookingWidget,
  kyc: IdentityCheck,
  status: StatusPage,
};
