import type { Offer, OfferDetails } from "../models/offer.ts";
import type { PeriodCode } from "../models/offer.ts";
import { API_URL, ApiError, readJson } from "../utils/api.ts";
import { isOfferDetails, isOfferList } from "../utils/guards.ts";

export const getOffers = async (
  token: string,
  period?: PeriodCode,
  signal?: AbortSignal,
): Promise<Offer[]> => {
  const query = period === undefined ? "" : `?period=${encodeURIComponent(period)}`;
  const response = await fetch(`${API_URL}/offers${query}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};

export const getOfferDetails = async (
  token: string,
  offerId: number,
  signal?: AbortSignal,
): Promise<OfferDetails> => {
  const response = await fetch(`${API_URL}/offers/${offerId}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferDetails, "Chargement du détail impossible");
};

export const applyToOffer = async (
  token: string,
  offerId: number,
  message: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/offers/${offerId}/applications`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  await readJson(response, (value): value is { status: "IN_PROGRESS" } =>
    typeof value === "object" &&
    value !== null &&
    (value as { status?: unknown }).status === "IN_PROGRESS",
  "Envoi de la candidature impossible");
};

export const withdrawApplication = async (token: string, offerId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/offers/${offerId}/applications`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Retrait de la candidature impossible (statut ${response.status})`,
    );
  }
};
