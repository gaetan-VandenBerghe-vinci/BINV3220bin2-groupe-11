import { Router } from "express";
import { toOfferDetailsDto, toOfferDto } from "../mappers/offer.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import type { OffersService } from "../services/offers.service.ts";
import { canApplyToOffers, canListOffers } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const isPeriodCode = (value: string): value is PeriodCode =>
  PERIOD_CODES.some((period) => period === value);

const parsePeriod = (value: unknown): PeriodCode | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !isPeriodCode(value)) {
    throw new HttpError(
      400,
      "INVALID_QUERY",
      "Le paramètre period doit valoir P1, P2 ou OTHER",
    );
  }
  return value;
};

const parseOfferId = (value: unknown): number => {
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_PARAM", "L'identifiant de l'offre est invalide");
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "INVALID_PARAM", "L'identifiant de l'offre est invalide");
  }
  return id;
};

const parseApplicationBody = (body: unknown): string | null => {
  if (body === undefined) return null;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit contenir un message facultatif");
  }
  const message = (body as { message?: unknown }).message;
  if (message === undefined || message === null || (typeof message === "string" && message.trim() === "")) {
    return null;
  }
  if (typeof message !== "string" || message.length > 2000) {
    throw new HttpError(400, "INVALID_BODY", "Le message doit être une chaîne de 2 000 caractères maximum");
  }
  return message.trim();
};

export const createOffersRouter = (offersService: OffersService) => {
  const router = Router();

  router.get("/", authorize(canListOffers), (req, res) => {
    const period = parsePeriod(req.query.period);
    res.json(offersService.listOffers(getCurrentUser(req), period).map(toOfferDto));
  });

  router.get("/:offerId", authorize(canApplyToOffers), (req, res) => {
    const offer = offersService.getOfferDetails(getCurrentUser(req), parseOfferId(req.params.offerId));
    res.json(toOfferDetailsDto(offer));
  });

  router.post("/:offerId/applications", authorize(canApplyToOffers), (req, res) => {
    offersService.applyToOffer(
      getCurrentUser(req),
      parseOfferId(req.params.offerId),
      parseApplicationBody(req.body),
    );
    res.status(201).json({ status: "IN_PROGRESS" });
  });

  router.delete("/:offerId/applications", authorize(canApplyToOffers), (req, res) => {
    offersService.withdrawApplication(
      getCurrentUser(req),
      parseOfferId(req.params.offerId),
    );
    res.status(204).send();
  });

  return router;
};
