import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  PawPrint,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  Shuffle,
  Heart,
  X,
  Share2,
  ChevronDown,
  RotateCcw,
  Search,
  Check,
  LoaderCircle,
  Bone,
  Info,
} from "lucide-react";
import Map from "./Map";
import Dog, { PuppyParade, dogType } from "./Dog";
import { description } from "./breeds";
import "./styles.css";
const fmt = (n) => n.toLocaleString("en-US");
const top = (rows) => rows?.filter((r) => r.count === rows[0]?.count) || [];
function App() {
  const [data, setData] = useState(null),
    [geo, setGeo] = useState(null),
    [boroughs, setBoroughs] = useState(null),
    [loadError, setLoadError] = useState(false);
  const [input, setInput] = useState(""),
    [selected, setSelected] = useState(null),
    [message, setMessage] = useState(""),
    [shared, setShared] = useState(""),
    [copyFallback, setCopyFallback] = useState(false),
    [expanded, setExpanded] = useState(false);
  const searchRef = useRef(),
    resultRef = useRef();
  async function load() {
    setLoadError(false);
    try {
      const [d, g, b] = await Promise.all(
        ["summary", "zip-areas", "boroughs"].map(async (n) => {
          const r = await fetch(`/data/${n}.json`);
          if (!r.ok) throw Error();
          return r.json();
        }),
      );
      setData(d);
      setGeo(g);
      setBoroughs(b);
    } catch {
      setLoadError(true);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const usable = (z) => data?.zips[z]?.breedRecords >= 5;
  function choose(value, { history = true, focus = true } = {}) {
    const zip = value.trim();
    setShared("");
    setCopyFallback(false);
    if (!/^\d{5}$/.test(zip)) {
      setMessage("Five little digits, please! Enter a 5-digit ZIP code.");
      searchRef.current?.focus();
      return;
    }
    const known =
      !!data?.zips[zip] || geo?.features.some((f) => f.properties.zip === zip);
    if (!known) {
      setMessage(
        "That ZIP isn’t on our NYC list. Try a ZIP in one of the five boroughs, like 11222.",
      );
      searchRef.current?.focus();
      return;
    }
    setMessage("");
    setInput(zip);
    setSelected(zip);
    setExpanded(false);
    if (history) {
      const url = new URL(location.href);
      url.searchParams.set("zip", zip);
      window.history.pushState({}, "", url);
    }
    if (focus)
      setTimeout(() => {
        resultRef.current?.focus({ preventScroll: true });
        if (window.innerWidth < 760)
          document
            .querySelector(".explorer-toolbar")
            ?.scrollIntoView({
              block: "start",
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            });
      }, 50);
  }
  function reset() {
    setSelected(null);
    setInput("");
    setExpanded(false);
    setMessage("");
    const url = new URL(location.href);
    url.searchParams.delete("zip");
    window.history.pushState({}, "", url);
  }
  useEffect(() => {
    if (!data || !geo) return;
    const restore = () => {
      const z = new URLSearchParams(location.search).get("zip");
      if (z) choose(z, { history: false, focus: false });
      else {
        setSelected(null);
        setInput("");
        setMessage("");
      }
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [data, geo]);
  useEffect(() => {
    function key(e) {
      if (e.key === "Escape" && selected) {
        reset();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [selected]);
  function surprise() {
    const zips = Object.keys(data?.zips || {}).filter(usable);
    if (zips.length) choose(zips[Math.floor(Math.random() * zips.length)]);
  }
  async function share() {
    const url = new URL(location.href);
    url.searchParams.set("zip", selected);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `pupmap · ${selected}`,
          text: `Meet ZIP ${selected}’s top pups.`,
          url: url.href,
        });
        setShared("Shared with love!");
        return;
      }
    } catch (e) {
      if (e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url.href);
      setShared("Link copied!");
    } catch {
      setCopyFallback(true);
      setShared("Copy your link below.");
    }
  }
  const result = data?.zips[selected],
    winners = top(result?.breeds),
    names = top(result?.names),
    hasPolygon = geo?.features.some((f) => f.properties.zip === selected),
    ready = !!data && !!geo && !!boroughs;
  const otherBreeds =
    result?.breeds.filter((r) => r.count < winners[0]?.count) || [];
  return (
    <>
      <a href="#zip-search" className="skip-link">
        Skip to ZIP search
      </a>
      <header className="site-header">
        <a href="/" className="brand" aria-label="pupmap home">
          <span className="brand-paw">
            <PawPrint size={25} fill="currentColor" />
          </span>
          pupmap<span className="nyc-pill">NYC</span>
        </a>
        <nav aria-label="Main navigation">
          <a className="nav-active" href="#explore">
            Explore the map
          </a>
          <a
            href="#about"
            onClick={() => {
              document.querySelector("#about").open = true;
            }}
          >
            About the data <ArrowUpRight size={14} />
          </a>
          <span className="made-with">
            Made for dog people <Heart size={15} />
          </span>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> FIVE BOROUGHS. SO MANY GOOD DOGS.
            </div>
            <h1>
              Who’s the top dog
              <br />
              in your{" "}
              <span className="zip-title">
                ZIP code?
                <svg viewBox="0 0 300 18" aria-hidden="true">
                  <path d="M5 11 Q148 -2 293 8 M20 16 Q155 3 283 13" />
                </svg>
              </span>
            </h1>
            <p>Meet your area’s most popular dog breed and dog name.</p>
            <span className="source-label">
              <PawPrint size={13} /> Based on NYC dog-license records.
            </span>
          </div>
          <PuppyParade />
        </section>
        <section
          className="explorer"
          id="explore"
          aria-label="Explore NYC dogs"
        >
          <div className="explorer-toolbar">
            <form
              id="zip-search"
              onSubmit={(e) => {
                e.preventDefault();
                choose(input);
              }}
              noValidate
            >
              <label className="search-input">
                <MapPin size={20} />
                <span className="sr-only">Enter your NYC ZIP code</span>
                <input
                  ref={searchRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Enter your NYC ZIP code"
                  aria-describedby={message ? "search-message" : undefined}
                  aria-invalid={!!message}
                />
              </label>
              <button
                className="primary-button"
                disabled={!ready}
                type="submit"
              >
                Meet the pups <ArrowRight size={17} />
              </button>
            </form>
            <span className="toolbar-or">or take a little wander</span>
            <button
              className="surprise-button"
              disabled={!ready}
              onClick={surprise}
            >
              <Shuffle size={17} /> Surprise me!
            </button>
          </div>
          {message && (
            <div className="search-message" id="search-message" role="alert">
              <PawPrint size={18} />
              {message}
            </div>
          )}
          <div
            className={`map-stage ${selected ? "has-result" : ""} ${expanded ? "sheet-expanded" : ""}`}
          >
            {ready ? (
              <Map
                geo={geo}
                boroughs={boroughs}
                selected={selected}
                onSelect={choose}
                onReset={reset}
                expanded={expanded}
              />
            ) : (
              <div className="loading-state" role="status">
                <PawPrint size={36} />
                <h2>
                  {loadError
                    ? "The pups took a little detour."
                    : "Rounding up the neighborhood pups…"}
                </h2>
                {loadError ? (
                  <>
                    <p>We couldn’t load the map. Let’s give it another try.</p>
                    <button className="primary-button" onClick={load}>
                      Try again
                    </button>
                  </>
                ) : (
                  <LoaderCircle className="spin" />
                )}
              </div>
            )}
            <div className="map-top-label">
              <span className="live-dot" /> THE NYC PUP MAP{" "}
              <span className="map-year">
                {data?.meta.year || "2024"} records
              </span>
            </div>
            {ready && !selected && (
              <aside className="welcome-card">
                <div className="tape" />
                <span className="tiny-label">HELLO, NEIGHBOR!</span>
                <h2>
                  Every ZIP has
                  <br />a top dog.
                </h2>
                <p>
                  Find out who’s leaving
                  <br />
                  paw prints in your corner
                  <br />
                  of the city.
                </p>
                <div className="welcome-dog">
                  <span className="dog-halo" />
                  <Dog breed="Dachshund" decorative />
                  <span className="welcome-heart">♡</span>
                </div>
                <div className="welcome-instruction">
                  <MapPin size={19} />
                  <span>
                    Enter your ZIP above
                    <br />
                    or pick a spot on the map.
                  </span>
                </div>
                <button className="text-button" onClick={() => choose("11222")}>
                  Take a peek at 11222 <ArrowRight size={15} />
                </button>
              </aside>
            )}
            {selected && (
              <aside
                className={`result-card ${expanded ? "expanded" : ""}`}
                ref={resultRef}
                tabIndex={-1}
                aria-label={`Dog license results for ZIP ${selected}`}
              >
                <button
                  className="sheet-handle"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  aria-label={
                    expanded ? "Collapse result sheet" : "Expand result sheet"
                  }
                >
                  <span />
                  <small>{expanded ? "Less" : "See all pup details"}</small>
                </button>
                <div className="result-top">
                  <span className="tiny-label">
                    <PawPrint size={13} /> MEET YOUR ZIP’S TOP PUP
                  </span>
                  <button
                    className="close-button"
                    onClick={() => {
                      reset();
                      searchRef.current?.focus();
                    }}
                    aria-label="Close results"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="zip-heading">
                  <h2>{selected}</h2>
                  {result?.borough ||
                  geo?.features.find((f) => f.properties.zip === selected)
                    ?.properties.borough ? (
                    <span>
                      <MapPin size={12} />
                      {result?.borough ||
                        geo.features.find((f) => f.properties.zip === selected)
                          .properties.borough}
                    </span>
                  ) : null}
                </div>
                {!usable(selected) ? (
                  <div className="insufficient">
                    <Dog breed="Mixed breed" />
                    <h3>A few more paws, please.</h3>
                    <p>
                      This NYC ZIP has{" "}
                      {result
                        ? `${fmt(result.breedRecords)} eligible breed license records`
                        : "no license records in this extract"}
                      . We need at least 5 to show a ranking.
                    </p>
                    <button className="primary-button" onClick={surprise}>
                      Meet another ZIP <Shuffle size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="breed-label">
                      Most common recorded breed
                      {winners.length > 1 ? " · tied" : ""}
                    </div>
                    <h3 className="breed-title">
                      {winners.map((w) => w.name).join(" & ")}
                    </h3>
                    {winners.map((w, i) => (
                      <React.Fragment key={w.name}>
                        <div
                          className={`portrait-frame ${i ? "tie-portrait" : ""}`}
                        >
                          <span className="portrait-spark">✧</span>
                          <Dog breed={w.name} />
                          <span className="portrait-heart">♡</span>
                          <span className="portrait-count">
                            {fmt(w.count)} license records
                            {winners.length > 1 ? " · tied" : ""}
                          </span>
                        </div>
                        {winners.length > 1 && <h4>{w.name}</h4>}
                        {winners.length > 1 && (
                          <p className="breed-description">
                            {description(w.name)}
                          </p>
                        )}
                        {dogType(w.name) === "generic" && (
                          <span className="generic-note">
                            A friendly stand-in portrait for this breed.
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                    <div className="name-tag">
                      <span className="tag-hole" />
                      <div>
                        <span>
                          Most popular dog name
                          {names.length > 1 ? " · tied" : ""}
                        </span>
                        <strong>
                          {names.length
                            ? names.map((n) => n.name).join(" & ")
                            : "No eligible names yet"}
                        </strong>
                        <small>
                          {names.length
                            ? `${fmt(names[0].count)} license records${names.length > 1 ? " each" : ""} · across all breeds`
                            : "Missing and placeholder names excluded"}
                        </small>
                      </div>
                      <Heart size={22} />
                    </div>
                    {winners.length === 1 && (
                      <p className="breed-description">
                        {description(winners[0].name)}
                      </p>
                    )}
                    <details className="more-pups">
                      <summary>
                        More neighborhood pups <ChevronDown size={15} />
                      </summary>
                      {otherBreeds.length ? (
                        otherBreeds.map((b, i) => (
                          <div className="other-breed" key={b.name}>
                            <span className="rank-paw">
                              <PawPrint size={14} />
                            </span>
                            <span>{b.name}</span>
                            <small>
                              {fmt(b.count)} records
                              {otherBreeds.filter((x) => x.count === b.count)
                                .length > 1
                                ? " · tied"
                                : ""}
                            </small>
                          </div>
                        ))
                      ) : (
                        <p>No other eligible breeds in this sample.</p>
                      )}
                      <p className="detail-footnote">
                        Next two count ranks, including all ties.
                      </p>
                    </details>
                    <p className="sample-note">
                      {data.meta.year} extract · {fmt(result.total)} license
                      records
                      <br />
                      {result.total < 30
                        ? "A little sample — treat this as a small peek."
                        : `${fmt(result.breedRecords)} with known breeds · ${fmt(result.namedRecords)} with eligible names`}
                    </p>
                  </>
                )}
                {!hasPolygon && (
                  <p className="polygon-note">
                    <Info size={14} /> This ZIP has no matching map area. Its
                    results are still here.
                  </p>
                )}
                <button className="share-button" onClick={share}>
                  <Share2 size={15} /> Share this ZIP
                </button>
                <span role="status" className="share-status">
                  {shared}
                </span>
                {copyFallback && (
                  <input
                    className="copy-link"
                    aria-label="Link to this ZIP"
                    readOnly
                    value={location.href}
                    onFocus={(e) => e.target.select()}
                  />
                )}
              </aside>
            )}
            <div className="map-bottom-note">
              <span className="legend-swatch" />
              {selected ? (
                <>
                  <PawPrint size={13} /> A little closer to your neighbors
                </>
              ) : (
                "Little boundaries. Lots of personality."
              )}
            </div>
            {ready && (
              <button className="reset-button" onClick={reset}>
                <RotateCcw size={14} /> Back to all NYC
              </button>
            )}
            {!selected && (
              <div className="map-sticker" aria-hidden="true">
                <Bone size={29} />
                <span>
                  good dogs
                  <br />
                  everywhere
                </span>
              </div>
            )}
          </div>
          <div className="map-footer">
            <span>
              <MapPin size={14} /> Pick a ZIP. Meet the locals. Fall a little in
              love.
            </span>
            <span>Pastels mark ZIP areas, not rankings.</span>
          </div>
        </section>
        <section className="under-map">
          <div className="little-love">
            <div className="love-icon">
              <Heart size={22} />
            </div>
            <div>
              <h2>Big city. Little paws.</h2>
              <p>A love letter to the dogs who make New York feel like home.</p>
            </div>
            <div className="paw-trail" aria-hidden="true">
              <PawPrint />
              <PawPrint />
              <PawPrint />
            </div>
          </div>
          <div className="data-note">
            <Info size={16} />
            <p>
              Based on NYC dog-license records. These pups represent recorded
              licenses, not every dog in NYC.
            </p>
          </div>
          <details id="about" className="about-data">
            <summary>
              <span>Good dogs. Honest data.</span>
              <span>
                About the data <ChevronDown size={16} />
              </span>
            </summary>
            <div className="methodology">
              <div>
                <h3>A snapshot of recorded licenses</h3>
                <p>
                  Source:{" "}
                  <a
                    href="https://data.cityofnewyork.us/d/nu7n-tubp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NYC Dog Licensing Dataset ↗
                  </a>
                  , published by NYC Health. This site uses only the{" "}
                  <strong>2024 annual extract</strong>, retrieved September 30,
                  2026. The source currently lists 2026 and 2024 but no 2025
                  extract. Since 2026 is still in progress, 2024 is the latest
                  available completed calendar-year extract; the publisher
                  provides no separate completeness certification.
                </p>
                <p>
                  Each record represents a license period, not necessarily one
                  dog. Renewals can produce multiple records. We removed{" "}
                  {fmt(data?.meta.exactDuplicatesRemoved || 843)} exact
                  duplicates across all eight source fields from{" "}
                  {fmt(data?.meta.sourceRecords || 105974)} source records. We
                  do not merge similar names, breeds, birth years, or ZIPs. No
                  reliable individual-dog identifier is provided.
                </p>
              </div>
              <div>
                <h3>How we find the top pups</h3>
                <p>
                  Capitalization and repeated whitespace are normalized. Missing
                  and unknown breeds are excluded from breed rankings.
                  Meaningful mixed-breed categories stay separate from
                  purebreds. Names are ranked independently across all eligible
                  named license records in the ZIP, regardless of breed. All
                  first-place ties are shown.
                </p>
                <p>
                  Missing names, numeric/punctuation-only names, and these
                  placeholder labels are excluded:{" "}
                  {data?.meta.excludedNames.filter(Boolean).join(", ") ||
                    "unknown, name not provided, not provided, n/a, na, none, no name, unnamed, dog, name, null, unavailable, not named, tbd"}
                  .
                </p>
                <p>
                  At least 5 records with known breeds are needed to display
                  rankings. Samples below 30 total license records get a gentle
                  small-sample note. This is a descriptive snapshot of recorded
                  licenses, not a survey of every NYC dog.
                </p>
              </div>
              <div>
                <h3>Putting paws on the map</h3>
                <p>
                  ZIP areas come from the{" "}
                  <a
                    href="https://data.cityofnewyork.us/d/35j5-n34v"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NYC-published Census ZCTA boundaries ↗
                  </a>
                  . ZCTAs approximate postal ZIP-code areas; they are not exact
                  USPS delivery boundaries. Shapes are clipped to{" "}
                  <a
                    href="https://data.cityofnewyork.us/d/gthc-hcne"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NYC Planning’s shoreline borough boundaries ↗
                  </a>{" "}
                  and lightly simplified for display.
                </p>
                <p>
                  Borough labels use geographic overlap (more than 1% of the
                  clipped ZIP area); multiple boroughs are shown where
                  applicable. ZIPs without a map polygon can still show license
                  results, with no inferred borough label. Decorative dogs are
                  illustrations, not location markers.
                </p>
                <p>
                  Breed label synonyms: “Bull Dog, French” → “French Bulldog”;
                  “Retriever, Labrador” → “Labrador Retriever”; “Retriever,
                  Golden” → “Golden Retriever”; “Dachshund Smooth Coat” →
                  “Dachshund, Smooth Coat.”
                </p>
              </div>
            </div>
          </details>
        </section>
      </main>
      <footer className="site-footer">
        <a className="brand" href="/">
          {" "}
          <PawPrint size={20} fill="currentColor" /> pupmap
        </a>
        <span>Made with love for New York & its very good dogs.</span>
        <span>
          Five boroughs. One big pack. <Heart size={13} />
        </span>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
