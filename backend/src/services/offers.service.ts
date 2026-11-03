import { toOffer, toOfferDetails } from "../mappers/offer.mapper.ts";
import type { Offer } from "../models/offer.ts";
import type { User } from "../models/user.ts";
import type { OfferFilter, OffersRepository } from "../repositories/offers.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { hasContactRole, isAdmin, isStudent } from "./permissions.ts";

/**
 * Offres visibles selon le profil (CdC § 4) : toutes pour l'administrateur, les offres
 * publiées pour l'étudiant, les offres qu'il a déposées pour un déposant.
 */
const visibilityFilter = (viewer: User): OfferFilter => {
  if (isAdmin(viewer)) return {};
  if (isStudent(viewer)) return { status: "PUBLISHED" };
  if (hasContactRole(viewer, "DEPOSITOR")) return { depositorContactId: viewer.id };
  throw new HttpError(403, "FORBIDDEN", "Vous n'avez pas accès aux offres");
};

export const createOffersService = (repository: OffersRepository) => ({
  listOffers: (viewer: User, period?: OfferFilter["period"]): Offer[] =>
    repository.findAll({ ...visibilityFilter(viewer), period }).map(toOffer),
  getOfferDetails: (viewer: User, offerId: number) => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Seuls les étudiants peuvent consulter ce détail");
    }
    const offer = repository.findDetailsForStudent({ offerId, studentId: viewer.id });
    if (offer === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Offre publiée introuvable");
    }
    return toOfferDetails(offer);
  },
  applyToOffer: (viewer: User, offerId: number, message: string | null): void => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Seuls les étudiants peuvent candidater");
    }
    const offer = repository.findDetailsForStudent({ offerId, studentId: viewer.id });
    if (offer === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Offre publiée introuvable");
    }
    if (repository.findApplication({ offerId, studentId: viewer.id }) !== undefined) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà traité cette offre");
    }
    repository.createApplication({ offerId, studentId: viewer.id, message });
  },
  withdrawApplication: (viewer: User, offerId: number): void => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Seuls les étudiants peuvent retirer une candidature");
    }
    const application = repository.findApplication({ offerId, studentId: viewer.id });
    if (application === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Candidature introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_PROCESSED", "Cette candidature a déjà été traitée");
    }
    repository.deleteInProgressApplication({ offerId, studentId: viewer.id });
  },
});

export type OffersService = ReturnType<typeof createOffersService>;
