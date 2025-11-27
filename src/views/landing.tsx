import { AppLink, lk } from "../lib/links";

// SVG Icon Components (Heroicons)
const DocumentTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 17l-3.32-3.32a2 2 0 010-2.828l9.172-9.172a2 2 0 012.828 0L20 5.172a2 2 0 010 2.828L10.828 17H8zm0 0v-2m10-2.828l-2.828-2.828"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

const LocationMarkerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ChatAlt2Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z"
    />
  </svg>
);

const NewspaperIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h.01M17 17h.01"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M16 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export function LandingPage() {
  const features = [
    {
      icon: <DocumentTextIcon />,
      title: "Din Digitale Dokumentmappe",
      description:
        "Hold styr på dine licenser, forsikringer og andre vigtige papirer. Gozy minder dig om fornyelser, så du altid er køreklar.",
    },
    {
      icon: <CarIcon />,
      title: "Find Dit Næste Køretøj",
      description:
        "Modtag attraktive tilbud på nye biler og udstyr, så du kan træffe det bedste valg for din forretning.",
    },
    {
      icon: <LocationMarkerIcon />,
      title: "Book Tid hos RTT-Drift",
      description:
        "Spar tid og undgå telefonkø. Book nemt tid til installation eller service af dit taxameter direkte i Gozy.",
    },
    {
      icon: <ChatAlt2Icon />,
      title: "Direkte Beskeder",
      description:
        "Få vigtige beskeder og nyheder sendt direkte til din telefon via WhatsApp. Hurtigt, nemt og effektivt.",
    },
    {
      icon: <NewspaperIcon />,
      title: "Nyheder & Viden",
      description:
        "Hold dig opdateret på branchenyheder, lovgivning og tips, der kan hjælpe dig med at drive en bedre forretning.",
    },
    {
      icon: <UsersIcon />,
      title: "Netværk med Kolleger",
      description:
        "Del viden og erfaringer med andre selvstændige vognmænd i et lukket og professionelt netværk.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Gozy: Din Partner for en Lettere Hverdag som Taxivognmand
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100">
            Som selvstændig vognmand står du med det hele selv. Gozy er dit
            digitale værktøj, der samler alt fra dokumenter og aftaler til
            kommunikation ét sted, så du kan fokusere på at køre.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href={lk(AppLink.Signup)}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-50 transition-colors no-underline"
            >
              Kom i gang
            </a>
            <a
              href="#features"
              className="inline-block bg-blue-500 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-400 transition-colors no-underline"
            >
              Læs mere
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Et Værktøj Bygget til Dig
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Gozy er designet til at gøre din hverdag som selvstændig vognmand
              lettere.
            </p>
          </div>
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Focus Section */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="relative h-80 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2832&auto=format&fit=crop"
                alt="Chauffør-fællesskab"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-600 opacity-20"></div>
            </div>
            <div className="mt-10 lg:mt-0">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Et Netværk af Kolleger
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Som selvstændig er du din egen chef, men du er ikke alene. Gozy
                forbinder dig med et netværk af andre vognmænd, hvor I kan dele
                viden, erfaringer og gode råd.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-800">
                    ✓
                  </span>
                  <p className="ml-3 text-base text-gray-600">
                    Få svar på spørgsmål fra erfarne kolleger.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-800">
                    ✓
                  </span>
                  <p className="ml-3 text-base text-gray-600">
                    Del dine egne tips og tricks med andre.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-800">
                    ✓
                  </span>
                  <p className="ml-3 text-base text-gray-600">
                    Hold dig opdateret på hvad der rører sig i branchen.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-blue-600">
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">
              Klar til at Få Styr på Din Forretning?
            </span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-100">
            Opret en konto i dag og oplev, hvor nemt det er at samle dine
            aftaler, dokumenter og kommunikation ét sted.
          </p>
          <a
            href={lk(AppLink.Signup)}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto no-underline"
          >
            Kom i gang her
          </a>
        </div>
      </section>
    </>
  );
}
