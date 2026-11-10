import { useEffect, useState } from "react";
import type { OfferDetails } from "../models/offer.ts";
import { getOfferDetails } from "../services/offers.service.ts";
import { isUnauthorized } from "../utils/api.ts";

interface OfferDetailsState {
  offerId: number;
  offer: OfferDetails | null;
  error: string | null;
}

export const useOfferDetails = (
  token: string,
  offerId: number | undefined,
  onUnauthorized: () => void,
) => {
  const [details, setDetails] = useState<OfferDetailsState>();

  useEffect(() => {
    if (offerId === undefined) return;

    const controller = new AbortController();

    getOfferDetails(token, offerId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetails({ offerId, offer: data, error: null });
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) onUnauthorized();
        else {
          setDetails({
            offerId,
            offer: null,
            error: reason instanceof Error ? reason.message : "Erreur inconnue",
          });
        }
      });

    return () => controller.abort();
  }, [token, offerId, onUnauthorized]);

  const currentDetails = details?.offerId === offerId ? details : undefined;
  return {
    offer: currentDetails?.offer ?? null,
    isLoading: offerId !== undefined && currentDetails === undefined,
    error: currentDetails?.error ?? null,
  };
};
