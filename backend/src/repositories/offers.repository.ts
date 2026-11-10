import type { Db } from "../db/database.ts";
import type {
  ApplicationStatus,
  OfferDbo,
  OfferStatus,
  PeriodCode,
} from "../models/offer.ts";

export interface OfferFilter {
  /** Limite aux offres de ce statut. */
  status?: OfferStatus;
  /** Limite aux offres déposées par ce contact. */
  depositorContactId?: number;
  /** Limite aux offres de cette période. */
  period?: PeriodCode;
}

interface FindAllParams {
  status: OfferStatus | null;
  depositorContactId: number | null;
  period: PeriodCode | null;
}

export interface OfferDetailsDbo extends OfferDbo {
  application_id: number | null;
  application_message: string | null;
  application_status: ApplicationStatus | null;
  application_applied_at: string | null;
}

interface FindDetailsParams {
  offerId: number;
  studentId: number;
}

interface CreateApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface ApplicationParams {
  offerId: number;
  studentId: number;
}

interface ApplicationDbo {
  id: number;
  message: string | null;
  status: ApplicationStatus;
  applied_at: string;
}

export const createOffersRepository = (db: Db) => {
  const findAll = db.prepare<FindAllParams, OfferDbo>(`
    SELECT o.id, o.title, o.description, o.status,
           o.company_id, c.short_name AS company_short_name,
           o.depositor_contact_id,
           ay.label AS academic_year_label, p.code AS period_code,
           o.created_at, o.updated_at
    FROM offers o
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE (@status IS NULL OR o.status = @status)
      AND (@depositorContactId IS NULL OR o.depositor_contact_id = @depositorContactId)
      AND (@period IS NULL OR p.code = @period)
    ORDER BY ay.start_date DESC, o.created_at DESC
  `);

  const findDetailsForStudent = db.prepare<FindDetailsParams, OfferDetailsDbo>(`
    SELECT o.id, o.title, o.description, o.status,
           o.company_id, c.short_name AS company_short_name,
           o.depositor_contact_id,
           ay.label AS academic_year_label, p.code AS period_code,
           o.created_at, o.updated_at,
           a.id AS application_id, a.message AS application_message,
           a.status AS application_status, a.applied_at AS application_applied_at
    FROM offers o
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    LEFT JOIN applications a
      ON a.offer_id = o.id AND a.student_id = @studentId AND a.status <> 'WITHDRAWN'
    WHERE o.id = @offerId AND o.status = 'PUBLISHED'
  `);

  const findApplication = db.prepare<ApplicationParams, ApplicationDbo>(`
    SELECT id, message, status, applied_at
    FROM applications
    WHERE offer_id = @offerId
      AND student_id = @studentId
      AND status <> 'WITHDRAWN'
  `);

  const insertApplication = db.prepare(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
  `);

  const deleteInProgressApplication = db.prepare<ApplicationParams>(`
    DELETE FROM applications
    WHERE offer_id = @offerId
      AND student_id = @studentId
      AND status = 'IN_PROGRESS'
  `);

  return {
    /** Offres correspondant au filtre, de la plus récente année à la plus ancienne. */
    findAll: ({ status, depositorContactId, period }: OfferFilter): OfferDbo[] =>
      findAll.all({
        status: status ?? null,
        depositorContactId: depositorContactId ?? null,
        period: period ?? null,
      }),
    findDetailsForStudent: ({ offerId, studentId }: FindDetailsParams): OfferDetailsDbo | undefined =>
      findDetailsForStudent.get({ offerId, studentId }),
    findApplication: ({ offerId, studentId }: ApplicationParams): ApplicationDbo | undefined =>
      findApplication.get({ offerId, studentId }),
    createApplication: ({ offerId, studentId, message }: CreateApplicationParams): void => {
      insertApplication.run({ offerId, studentId, message });
    },
    deleteInProgressApplication: ({ offerId, studentId }: ApplicationParams): boolean =>
      deleteInProgressApplication.run({ offerId, studentId }).changes > 0,
  };
};

export type OffersRepository = ReturnType<typeof createOffersRepository>;
