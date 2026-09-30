const profiles = {
  "Yorkshire Terrier": [
    "A little dog with a silky coat, perky ears, and plenty of expression. Yorkies are often curious and spirited, with personalities much bigger than their paws.",
  ],
  "Shih Tzu": [
    "With a flowing coat, round eyes, and a short muzzle, this little companion is easy to recognize. Shih Tzus are often affectionate and playful, though every pup has their own pace.",
  ],
  Chihuahua: [
    "Tiny in size, with bright eyes and wonderfully expressive ears. Chihuahuas are often alert and devoted companions, with a surprising amount of confidence.",
  ],
  "French Bulldog": [
    "Bat-like ears, a short muzzle, and a sturdy little body make the Frenchie unmistakable. Many are playful, sociable companions who enjoy being close to their people.",
  ],
  "Labrador Retriever": [
    "A sturdy build, soft floppy ears, and an otter-like tail give Labs their familiar look. They are often outgoing and enthusiastic, especially when there is a game to join.",
  ],
  "Golden Retriever": [
    "A golden coat, gentle expression, and feathery tail give this pup a sunny look. Goldens are often sociable and eager to participate in family activities.",
  ],
  Maltese: [
    "A petite companion with a white, silky coat and dark, expressive eyes. Maltese dogs are often lively and affectionate, with their own individual quirks.",
  ],
  Havanese: [
    "This small companion has a soft, flowing coat and a tail that curls over its back. Havanese dogs are often cheerful and sociable, enjoying both play and company.",
  ],
  Poodle: [
    "A curly coat, long muzzle, and light-footed build are classic poodle features. Poodles are often attentive and active, and many enjoy learning new things.",
  ],
  "German Shepherd Dog": [
    "Upright ears, a long muzzle, and an athletic frame give this dog a distinctive silhouette. German Shepherds are often alert and responsive, with a love of purposeful activity.",
  ],
  Dachshund: [
    "A long body, short legs, and soft hanging ears make this little hound unmistakable. Dachshunds are often curious and determined, with a nose for an interesting adventure.",
  ],
  Pomeranian: [
    "A fluffy double coat, fox-like face, and plumed tail define this little companion. Pomeranians are often lively and alert, with plenty of interest in the world around them.",
  ],
  Beagle: [
    "Floppy ears, a short coat, and a compact, sturdy body give this hound a familiar look. Beagles are often sociable and curious, especially when an interesting scent is involved.",
  ],
  "Jack Russell Terrier": [
    "Small and athletic, this terrier usually has a mostly white coat with colored patches. Many are energetic and inquisitive, with a strong interest in play and exploration.",
  ],
  "Shiba Inu": [
    "A plush coat, triangular ears, and a curled tail give this pup a fox-like look. Shibas are often alert and independent, though each dog relates to people in their own way.",
  ],
  "Siberian Husky": [
    "A thick double coat, upright ears, and a brush-like tail suit this athletic dog. Huskies are often energetic and sociable, with an enthusiastic interest in exploring.",
  ],
  "Australian Shepherd": [
    "A medium-length coat, athletic build, and varied markings distinguish this herding dog. Aussies are often attentive and energetic, enjoying activities that engage their minds.",
  ],
  "Cavalier King Charles Spaniel": [
    "Silky ears, round eyes, and a softly feathered coat give this little spaniel a gentle look. Many are affectionate and adaptable companions who enjoy time with their people.",
  ],
  "American Pit Bull Terrier/Pit Bull": [
    "A short coat, broad head, and muscular build are common in this recorded category. These dogs can be energetic and people-oriented, with temperament varying by individual.",
  ],
  "American Staffordshire Terrier": [
    "A broad head, short coat, and sturdy frame give this terrier a distinctive look. Many are confident and enthusiastic companions, with their own individual temperaments.",
  ],
  "Cane Corso": [
    "A large, muscular body, broad muzzle, and short coat characterize this breed. Cane Corsos are often attentive and watchful, with individual personalities shaped by experience.",
  ],
  "Schnauzer, Miniature": [
    "Bushy eyebrows, a whiskered muzzle, and a wiry coat distinguish this small schnauzer. Many are alert and lively companions with a curious approach to their surroundings.",
  ],
  "Border Terrier": [
    "A wiry coat, small folded ears, and an otter-like head define this compact terrier. Border Terriers are often active and inquisitive, with an enthusiasm for exploring.",
  ],
  "Welsh Terrier": [
    "A wiry black-and-tan coat and a bearded muzzle give this terrier its distinctive look. Many are energetic and curious, enjoying play and activity.",
  ],
  "Welsh Corgi, Cardigan": [
    "Short legs, large rounded ears, and a long tail distinguish the Cardigan corgi. These herding dogs are often attentive and active, with a thoughtful interest in their surroundings.",
  ],
  Corgi: [
    "Short legs, a long body, and expressive upright ears are familiar corgi features. Corgis are often attentive and energetic, with individuals showing their own balance of playfulness and independence.",
  ],
  "American Eskimo Dog": [
    "A fluffy white coat, pointed ears, and a curled tail give this dog a bright appearance. Many are alert and active companions who enjoy engagement with their people.",
  ],
};
export function description(breed) {
  if (profiles[breed]) return profiles[breed][0];
  if (breed.startsWith("Poodle,")) return profiles.Poodle[0];
  if (/mix|crossbreed|doodle|maltipoo/i.test(breed))
    return "This mixed-breed category can include a lovely variety of coats, sizes, and features. Energy levels and personalities vary, so getting to know the individual pup is the best part.";
  return "Dogs in this recorded breed category have their own distinctive mix of features. Their personalities and preferences vary, so each pup is worth getting to know.";
}
