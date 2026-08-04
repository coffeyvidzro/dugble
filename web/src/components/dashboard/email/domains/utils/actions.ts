"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as store from "./store";
import type { TrackingConfig } from "./types";
import { isValidDomain } from "./validation";

const DOMAINS_PATH = "/dashboard/email/domains";

export async function createDomainAction(
    rawDomain: string,
): Promise<{ error: string } | undefined> {
    const domain = rawDomain.trim().toLowerCase();

    if (!isValidDomain(domain)) {
        return { error: "Enter a valid domain, e.g. notify.yourcompany.com" };
    }

    const created = store.createDomain(domain);
    revalidatePath(DOMAINS_PATH);
    redirect(`${DOMAINS_PATH}/${created.id}`);
}

export async function deleteDomainAction(
    id: string,
    options?: { redirectToList?: boolean },
): Promise<void> {
    store.deleteDomain(id);
    revalidatePath(DOMAINS_PATH);
    revalidatePath(`${DOMAINS_PATH}/${id}`);

    if (options?.redirectToList) {
        redirect(DOMAINS_PATH);
    }
}

export async function verifyDomainAction(id: string): Promise<void> {
    // Simulated DNS propagation check.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    store.verifyDomain(id);
    revalidatePath(DOMAINS_PATH);
    revalidatePath(`${DOMAINS_PATH}/${id}`);
}

export async function setReceivingEnabledAction(
    id: string,
    enabled: boolean,
): Promise<void> {
    store.setReceivingEnabled(id, enabled);
    revalidatePath(`${DOMAINS_PATH}/${id}`);
    revalidatePath(DOMAINS_PATH);
}

export async function updateTrackingConfigAction(
    id: string,
    patch: Partial<TrackingConfig>,
): Promise<void> {
    store.updateTrackingConfig(id, patch);
    revalidatePath(`${DOMAINS_PATH}/${id}`);
}
