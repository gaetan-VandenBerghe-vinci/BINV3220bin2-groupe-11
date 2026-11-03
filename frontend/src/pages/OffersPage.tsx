import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import type { User } from "../models/user.ts";
import type { PeriodCode } from "../models/offer.ts";
import { applyToOffer, withdrawApplication } from "../services/offers.service.ts";
import { useOfferDetails } from "../hooks/useOfferDetails.ts";
import { isUnauthorized } from "../utils/api.ts";
import { PERIOD_LABELS } from "../utils/labels.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const PERIOD_OPTIONS: { value: "" | PeriodCode; label: string }[] = [
  { value: "", label: "Toutes les périodes" },
  { value: "P1", label: PERIOD_LABELS.P1 },
  { value: "P2", label: PERIOD_LABELS.P2 },
  { value: "OTHER", label: PERIOD_LABELS.OTHER },
];

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [period, setPeriod] = useState<PeriodCode | undefined>(undefined);
  const { offers, isLoading, error } = useOffers(token, period, onUnauthorized);
  const [selectedOfferId, setSelectedOfferId] = useState<number>();
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { offer: selectedOffer, isLoading: isDetailLoading, error: detailError } =
    useOfferDetails(token, selectedOfferId, onUnauthorized);

  const submitApplication = async () => {
    if (selectedOfferId === undefined) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await applyToOffer(token, selectedOfferId, message);
      setMessage("");
      setSelectedOfferId(undefined);
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else if (reason instanceof Error) setActionError(reason.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const withdraw = async () => {
    if (selectedOfferId === undefined) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await withdrawApplication(token, selectedOfferId);
      setSelectedOfferId(undefined);
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else if (reason instanceof Error) setActionError(reason.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          onSelect={user.kind === "STUDENT" ? setSelectedOfferId : undefined}
        />
        {user.kind === "STUDENT" && selectedOfferId !== undefined && (
          <aside className="offer-details" aria-label="Détail de l’offre">
            {isDetailLoading && <LoadingState />}
            {detailError && <ErrorState message={detailError} />}
            {selectedOffer && (
              <>
                <h2>{selectedOffer.title}</h2>
                <p>{selectedOffer.description}</p>
                {selectedOffer.application ? (
                  <>
                    <p>
                      Candidature :{" "}
                      {selectedOffer.application.status === "IN_PROGRESS"
                        ? "En cours"
                        : selectedOffer.application.status === "SELECTED"
                          ? "Retenue"
                          : "Refusée"}
                    </p>
                    {selectedOffer.application.status === "IN_PROGRESS" && (
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={isSubmitting}
                        onClick={withdraw}
                      >
                        Retirer ma candidature
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <label className="application-message">
                      <span>Message (facultatif)</span>
                      <textarea
                        value={message}
                        maxLength={2000}
                        onChange={(event) => setMessage(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={isSubmitting}
                      onClick={submitApplication}
                    >
                      Candidater
                    </button>
                  </>
                )}
                {actionError && <ErrorState message={actionError} />}
              </>
            )}
          </aside>
        )}
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label className="period-filter">
        <span>Période</span>
        <select
          value={period ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            setPeriod(value === "" ? undefined : (value as PeriodCode));
          }}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {renderContent()}
    </section>
  );
};

export default OffersPage;
