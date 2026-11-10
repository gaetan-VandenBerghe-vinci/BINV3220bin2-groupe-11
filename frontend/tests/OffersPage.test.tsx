import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getAllByText("Autre")).toHaveLength(2);
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("filtre les offres selon la période sélectionnée", async () => {
    const fetchMock = stubFetch({
      "/api/offers?period=P1": () => Response.json([offers[0]]),
      "/api/offers": () => Response.json(offers),
    });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(await screen.findByText("2 offres")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Période"), { target: { value: "P1" } });

    expect(await screen.findByText("1 offre")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/offers?period=P1",
      expect.objectContaining({ headers: { Authorization: "jeton" } }),
    );
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });

  it("permet à un étudiant de consulter une offre et de candidater", async () => {
    const fetchMock = stubFetch({
      "/api/offers/2/applications": () => Response.json({ status: "IN_PROGRESS" }, { status: 201 }),
      "/api/offers/2": () =>
        Response.json({
          ...offers[0],
          description: "Concevoir une API de facturation.",
          status: "PUBLISHED",
          application: null,
        }),
      "/api/offers": () => Response.json([offers[0]]),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Détails" }));
    expect(await screen.findByText("Concevoir une API de facturation.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Message (facultatif)"), {
      target: { value: "Ma motivation" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Candidater" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/offers/2/applications",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ message: "Ma motivation" }),
        }),
      ),
    );
  });

  it("permet à un étudiant de retirer une candidature en cours", async () => {
    const fetchMock = stubFetch({
      "/api/offers/2/applications": () => new Response(null, { status: 204 }),
      "/api/offers/2": () =>
        Response.json({
          ...offers[0],
          description: "Description",
          status: "PUBLISHED",
          application: {
            id: 1,
            message: null,
            status: "IN_PROGRESS",
            appliedAt: "2026-10-01",
          },
        }),
      "/api/offers": () => Response.json([offers[0]]),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Détails" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retirer ma candidature" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/offers/2/applications",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
  });
});
