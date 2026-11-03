import type {
  Application,
  Offer,
  OfferDbo,
  OfferDetails,
  OfferDetailsDto,
  OfferDto,
} from "../models/offer.ts";
import type { OfferDetailsDbo } from "../repositories/offers.repository.ts";

export const toOffer = (dbo: OfferDbo): Offer => ({
  id: dbo.id,
  title: dbo.title,
  description: dbo.description,
  status: dbo.status,
  company: { id: dbo.company_id, shortName: dbo.company_short_name },
  depositorContactId: dbo.depositor_contact_id,
  academicYear: dbo.academic_year_label,
  period: dbo.period_code,
  createdAt: dbo.created_at,
  updatedAt: dbo.updated_at,
});

export const toOfferDto = (offer: Offer): OfferDto => ({
  id: offer.id,
  title: offer.title,
  companyShortName: offer.company.shortName,
  academicYear: offer.academicYear,
  period: offer.period,
  status: offer.status,
});

export const toOfferDetails = (dbo: OfferDetailsDbo): OfferDetails => ({
  ...toOffer(dbo),
  application:
    dbo.application_id === null
      ? null
      : ({
          id: dbo.application_id,
          message: dbo.application_message,
          status: dbo.application_status!,
          appliedAt: dbo.application_applied_at!,
        } satisfies Application),
});

export const toOfferDetailsDto = (offer: OfferDetails): OfferDetailsDto => ({
  id: offer.id,
  title: offer.title,
  description: offer.description,
  companyShortName: offer.company.shortName,
  academicYear: offer.academicYear,
  period: offer.period,
  status: "PUBLISHED",
  application: offer.application,
});
