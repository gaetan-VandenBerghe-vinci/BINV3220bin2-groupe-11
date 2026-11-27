import { expect, test } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const existingOfferTitle = "Application React de gestion de flotte";

test("Scénario 1 : Lucas Dupont recherche une offre existante", async ({ page }) => {
  await page.goto(baseUrl);

  await page.getByRole("button", { name: "Lucas Dupont", exact: true }).click();
  await expect(page.getByText("Lucas Dupont", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Offres", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Offres de stage" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Rechercher par mot-clé" }).fill(existingOfferTitle);

  const offerRow = page
    .getByRole("row")
    .filter({ has: page.getByRole("cell", { name: existingOfferTitle, exact: true }) });
  await expect(offerRow).toHaveCount(1);
  await expect(offerRow).toContainText("Lumen Digital");
  await expect(page.getByText("1 offre", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("row").filter({
      has: page.getByRole("cell", { name: "API REST de facturation", exact: true }),
    }),
  ).toHaveCount(0);
});
