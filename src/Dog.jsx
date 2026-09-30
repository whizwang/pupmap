import React from "react";
export function dogType(breed = "") {
  const b = breed.toLowerCase();
  if (/crossbreed|mix|doodle|maltipoo/.test(b)) return "generic";
  if (b.includes("dachshund")) return "dachshund";
  if (b.includes("yorkshire")) return "yorkie";
  if (b.includes("shih tzu") || b === "havanese" || b === "maltese")
    return "fluffy";
  if (b.includes("chihuahua")) return "chihuahua";
  if (b.includes("french")) return "frenchie";
  if (b.includes("poodle")) return "poodle";
  if (b.includes("retriever")) return "retriever";
  if (b.includes("shepherd") || b.includes("shiba")) return "pointy";
  return "generic";
}
export default function Dog({
  breed = "Golden Retriever",
  className = "",
  decorative = false,
}) {
  const type = dogType(breed),
    dark = type === "yorkie",
    pointy = ["chihuahua", "frenchie", "pointy", "yorkie"].includes(type),
    fluffy = ["fluffy", "poodle"].includes(type);
  const fur = dark
    ? "#8b9296"
    : type === "frenchie"
      ? "#9eaaa6"
      : type === "fluffy"
        ? "#f7eee0"
        : type === "poodle"
          ? "#e6c5a6"
          : type === "dachshund"
            ? "#b9764e"
            : type === "pointy"
              ? "#d8a76c"
              : "#e7b770";
  const ear = dark
    ? "#b78c65"
    : type === "fluffy"
      ? breed === "Maltese"
        ? "#eee5d8"
        : "#c8ac95"
      : type === "frenchie"
        ? "#899590"
        : type === "dachshund"
          ? "#865037"
          : "#c99255";
  const label =
    type === "generic"
      ? `Illustrated friendly mixed-breed dog; a generic portrait for ${breed}`
      : `Hand-drawn ${breed} with ${pointy ? "upright ears" : fluffy ? "a soft fluffy coat" : "floppy ears"} and a friendly face`;
  return (
    <svg
      className={`dog-art ${className}`}
      viewBox="0 0 260 240"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
    >
      <g
        stroke="#654b3c"
        strokeWidth="3.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse
          cx="131"
          cy="220"
          rx="76"
          ry="10"
          fill="#6a4b39"
          opacity=".08"
          stroke="none"
        />
        {type === "dachshund" ? (
          <>
            <path
              d="M83 168 Q54 143 44 167 Q28 188 21 168"
              fill="none"
              stroke={fur}
              strokeWidth="16"
            />
            <path
              d="M67 163 Q113 145 188 166 Q212 187 187 211 L66 211 Q47 183 67 163"
              fill={fur}
            />
            <path
              d="M66 196 V218 H91 V196 M169 196 V218 H194 V193"
              fill={fur}
            />
          </>
        ) : (
          <>
            <path d="M186 175 Q226 146 222 176 Q218 199 186 202" fill={fur} />
            <path
              d="M89 150 Q71 172 77 214 Q92 225 110 213 L151 213 Q174 226 185 214 Q192 173 166 151"
              fill={fur}
            />
            <path d="M106 177 L102 216 M157 177 L161 216" fill="none" />
            <path d="M109 154 Q126 201 151 155" fill="#fff5e4" stroke="none" />
          </>
        )}
        <g transform={type === "dachshund" ? "translate(46 22) scale(.8)" : ""}>
          {pointy ? (
            <>
              <path d="M73 96 Q42 10 67 20 Q95 33 105 67" fill={ear} />
              <path d="M155 67 Q176 8 194 21 Q211 35 185 100" fill={ear} />
              <path
                d="M76 70 L67 36 L95 73 M167 73 L186 36 L183 78"
                fill="#e7b2a2"
                stroke="none"
              />
            </>
          ) : (
            <>
              <path
                d="M81 72 Q49 58 44 99 Q40 139 58 155 Q79 162 85 111"
                fill={ear}
              />
              <path
                d="M175 72 Q203 60 214 98 Q224 142 203 154 Q182 163 174 111"
                fill={ear}
              />
            </>
          )}
          {fluffy ? (
            <path
              d="M71 83 Q54 65 77 52 Q75 33 98 36 Q109 14 131 30 Q151 14 166 36 Q188 30 187 52 Q211 61 193 83 Q209 103 190 113 Q201 139 177 144 Q165 169 145 155 Q124 176 109 158 Q84 170 80 147 Q51 150 64 128 Q47 112 66 101 Q54 88 71 83"
              fill={fur}
            />
          ) : (
            <path
              d="M67 98 Q66 51 123 49 Q181 43 191 97 Q204 145 169 158 Q130 177 88 157 Q61 149 67 98"
              fill={fur}
            />
          )}
          {dark && (
            <path
              d="M73 95 Q94 65 111 108 L128 124 L146 103 Q168 66 185 97 L183 142 Q132 186 80 146Z"
              fill="#d5b28d"
              stroke="none"
            />
          )}
          {type === "pointy" && (
            <path
              d="M75 111 Q88 134 127 118 Q167 132 185 110 Q187 156 129 162 Q79 159 75 111"
              fill="#fff0d8"
              stroke="none"
            />
          )}
          {type === "frenchie" && (
            <path
              d="M122 54 L110 111 L130 130 L147 113 L137 52"
              fill="#fff6e7"
              stroke="none"
            />
          )}
          <ellipse
            cx="109"
            cy="130"
            rx="24"
            ry="22"
            fill="#fff1db"
            stroke="none"
          />
          <ellipse
            cx="145"
            cy="130"
            rx="24"
            ry="22"
            fill="#fff1db"
            stroke="none"
          />
          <ellipse
            cx="99"
            cy="106"
            rx="5.5"
            ry="7"
            fill="#483b32"
            stroke="none"
          />
          <ellipse
            cx="158"
            cy="106"
            rx="5.5"
            ry="7"
            fill="#483b32"
            stroke="none"
          />
          <circle cx="101" cy="103" r="1.8" fill="white" stroke="none" />
          <circle cx="160" cy="103" r="1.8" fill="white" stroke="none" />
          <ellipse
            cx="82"
            cy="123"
            rx="10"
            ry="6"
            fill="#eeb2a2"
            opacity=".7"
            stroke="none"
          />
          <ellipse
            cx="176"
            cy="123"
            rx="10"
            ry="6"
            fill="#eeb2a2"
            opacity=".7"
            stroke="none"
          />
          <path
            d="M118 121 Q129 115 139 121 Q140 129 129 133 Q118 129 118 121"
            fill="#584236"
          />
          <path
            d="M129 133 V138 Q118 147 113 139 M129 138 Q140 147 145 139"
            fill="none"
          />
          <path
            d="M124 144 Q130 149 136 144 L135 155 Q129 164 124 155Z"
            fill="#e3a29c"
            strokeWidth="2"
          />
          <path
            d="M92 161 Q129 174 166 160 L164 172 Q130 184 93 173Z"
            fill={type === "frenchie" ? "#e7b2bf" : "#a5bca0"}
            strokeWidth="2"
          />
          <circle cx="129" cy="180" r="8" fill="#f3d67d" strokeWidth="2" />
          <path d="M129 177 V181" strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}
export function PuppyParade() {
  return (
    <div className="puppy-parade" aria-hidden="true">
      <span className="scribble parade-note">your neighbors have paws.</span>
      <span className="spark spark-one">✧</span>
      <span className="little-heart">♡</span>
      <div className="parade-circle" />
      <Dog breed="Dachshund" className="parade-dachshund" decorative />
      <Dog breed="Golden Retriever" className="parade-golden" decorative />
      <Dog breed="French Bulldog" className="parade-frenchie" decorative />
      <span className="spark spark-two">✧</span>
      <div className="parade-caption">a little map. a lot of good dogs.</div>
    </div>
  );
}
