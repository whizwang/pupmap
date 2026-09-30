import { test, expect } from "@playwright/test";
import fs from "node:fs";
const data = JSON.parse(fs.readFileSync("public/data/summary.json"));
const geo = JSON.parse(fs.readFileSync("public/data/zip-areas.json"));
async function ready(page) {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Meet the pups", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".leaflet-interactive").first()).toBeVisible();
}
async function search(page, z) {
  await page.getByPlaceholder("Enter your NYC ZIP code").fill(z);
  await page.getByPlaceholder("Enter your NYC ZIP code").press("Enter");
}
test("desktop: map, real search, detail counts, reset, hover, and sharing", async ({
  page,
  context,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page);
  await page.screenshot({ path: "tests/home-desktop.png", fullPage: true });
  await search(page, "11222");
  await expect(page.locator(".result-card")).toContainText("Chihuahua");
  await expect(page.locator(".name-tag")).toContainText("Charlie");
  await expect(page.locator(".portrait-count")).toHaveText(
    "46 license records",
  );
  await expect(page.locator(".sample-note")).toContainText(
    "1,030 license records",
  );
  await expect(page).toHaveURL(/zip=11222/);
  await page.getByText("More neighborhood pups", { exact: true }).click();
  await expect(page.locator(".more-pups")).toContainText("Terrier Mix");
  await page.locator(".result-card").evaluate((el) => (el.scrollTop = 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tests/result-desktop.png", fullPage: true });
  await page
    .getByRole("button", { name: "Share this ZIP", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Link copied!");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "zip=11222",
  );
  await page.getByRole("button", { name: "Close results" }).click();
  await expect(page.locator(".welcome-card")).toBeVisible();
  await expect(page).not.toHaveURL(/zip=/);
  const zip = page.getByRole("button", {
    name: "Explore ZIP 11215, Brooklyn",
    exact: true,
  });
  await expect(zip).not.toHaveAttribute("d", "M0 0");
  await zip.hover();
  await expect(
    page.locator(".zip-tooltip").filter({ hasText: "11215" }),
  ).toBeVisible();
  await zip.focus();
  await zip.press("Enter");
  await expect(page.locator(".zip-heading")).toContainText("11215");
  await page
    .getByRole("button", { name: "Back to all NYC", exact: true })
    .click();
  await expect(page.locator(".result-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Surprise me!", exact: true }).click();
  await expect(page.locator(".result-card")).toBeVisible();
  expect(errors).toEqual([]);
});
test("validation, deep links, missing map geometry, ties and insufficient data", async ({
  page,
}) => {
  await ready(page);
  await search(page, "abc");
  await expect(page.getByRole("alert")).toContainText("Five little digits");
  await search(page, "90210");
  await expect(page.getByRole("alert")).toContainText("isn’t on our NYC list");
  const small = Object.entries(data.zips).find(
    ([z, s]) => s.breedRecords < 5,
  )[0];
  await search(page, small);
  await expect(page.locator(".result-card")).toContainText("A few more paws");
  const missing = Object.keys(data.zips).find(
    (z) =>
      data.zips[z].breedRecords >= 5 &&
      !geo.features.some((f) => f.properties.zip === z),
  );
  await search(page, missing);
  await expect(page.locator(".polygon-note")).toContainText(
    "no matching map area",
  );
  const tie = Object.entries(data.zips).find(
    ([z, s]) =>
      s.breedRecords >= 5 &&
      s.breeds.length > 1 &&
      s.breeds[0].count === s.breeds[1].count,
  )[0];
  await search(page, tie);
  await expect(page.locator(".breed-label")).toContainText("tied");
  await page.goto("/?zip=11222");
  await expect(page.locator(".name-tag")).toContainText("Charlie");
  await search(page, "10001");
  await page.goBack();
  await expect(page.locator(".zip-heading")).toContainText("11222");
});
test("mobile bottom sheet, expand, selection and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.screenshot({ path: "tests/home-mobile.png", fullPage: true });
  await search(page, "11222");
  await expect(page.locator(".result-card")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "tests/result-mobile-compact.png",
    fullPage: true,
  });
  const before = await page.locator(".result-card").boundingBox();
  await page.getByRole("button", { name: "Expand result sheet" }).click();
  const after = await page.locator(".result-card").boundingBox();
  expect(after.height).toBeGreaterThan(before.height);
  await page.screenshot({ path: "tests/result-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Close results" }).click();
  await expect(page.locator(".welcome-card")).toBeVisible();
});
test("loading failure is recoverable and manual sharing fallback is usable", async ({
  page,
}) => {
  await page.route("**/data/summary.json", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByText("The pups took a little detour.")).toBeVisible();
  await page.unroute("**/data/summary.json");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("button", { name: "Meet the pups", exact: true }),
  ).toBeEnabled();
  await search(page, "11222");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("no permission")) },
    });
  });
  await page
    .getByRole("button", { name: "Share this ZIP", exact: true })
    .click();
  await expect(page.getByLabel("Link to this ZIP")).toHaveValue(/zip=11222/);
});
test("selected boundary remains above mobile sheet after expansion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await search(page, "11222");
  await page.getByRole("button", { name: "Expand result sheet" }).click();
  await expect(page.locator(".result-card")).toHaveClass(/expanded/);
  await page.waitForTimeout(500);
  const polygon = await page
    .getByRole("button", { name: "Explore ZIP 11222, Brooklyn", exact: true })
    .boundingBox();
  const sheet = await page.locator(".result-card").boundingBox();
  expect(polygon.y + polygon.height).toBeLessThan(sheet.y);
});
test("pointer map selection, native sharing, and accessible pages", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  const homeA11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(homeA11y.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Explore ZIP 11215, Brooklyn", exact: true })
    .click({ force: true });
  await expect(page.locator(".zip-heading")).toContainText("11215");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      value: async (payload) => {
        window.sharedPayload = payload;
      },
    }),
  );
  await page
    .getByRole("button", { name: "Share this ZIP", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Shared with love!");
  expect(await page.evaluate(() => window.sharedPayload.url)).toContain(
    "zip=11215",
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
