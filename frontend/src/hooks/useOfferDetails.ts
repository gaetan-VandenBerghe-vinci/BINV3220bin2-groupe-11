import { useEffect, useState } from "react";
import type { OfferDetails } from "../models/offer.ts";
import { getOfferDetails } from "../services/offers.service.ts";
import { isUnauthorized } from "../utils/api.ts";

export const useOfferDetails = (
  token: string,
  offerId: number | undefined,
  onUnauthorized: () => void,
) => {
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (offerId === undefined) {
      setOffer(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getOfferDetails(token, offerId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setOffer(data);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) onUnauthorized();
        else setError(reason instanceof Error ? reason.message : "Erreur inconnue");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [token, offerId, onUnauthorized]);

  return { offer, isLoading, error };
};
