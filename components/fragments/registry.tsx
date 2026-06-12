import type { ComponentType } from "react";
import type { FragmentId } from "@/lib/content";
import { BookingWidget, IdentityCheck, StatusPage } from "./clients";
import { CommandPalette, MultiverseTimeline, SignInGateway } from "./paradox";
import { NotificationPrefs, Onboarding, RosterAdmin } from "./shiftsum";

/** Live fragment implementations, keyed by fragment id. */
export const FRAGMENT_COMPONENTS: Record<FragmentId, ComponentType> = {
  multiverse: MultiverseTimeline,
  gateway: SignInGateway,
  palette: CommandPalette,
  onboarding: Onboarding,
  notifications: NotificationPrefs,
  admin: RosterAdmin,
  booking: BookingWidget,
  kyc: IdentityCheck,
  status: StatusPage,
};
