import type { User, News } from "../../db/schema";
import { AppLink, lk } from "../../lib/links";
import type { ComplianceData } from "../../lib/compliance";
import { getProgressColor } from "../../lib/compliance";

type DashboardPageProps = {
  user: User;
  documentCount: number;
  compliance: ComplianceData;
  news: News[];
};

type Feature = {
  title: string;
  description: string;
  icon: string;
  link: string;
  gradient: string;
};

const features: Feature[] = [
  {
    title: "Dokumenter & Compliance",
    description:
      "Upload og administrer dine taxidokumenter. Få påmindelser om udløbsdatoer og hold styr på din compliance status.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    link: lk(AppLink.DashboardDocuments),
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "AI Chat Assistent",
    description:
      "Få øjeblikkelig hjælp på dansk med Gemini AI. Stil spørgsmål, søg dokumenter og få vejledning når du har brug for det.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    link: lk(AppLink.DashboardChat),
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Få tilbud på ny bil",
    description:
      "Få skræddersyede tilbud på taxi eller limousine. Udfyld en simpel formular og modtag de bedste tilbud fra vores partnere.",
    icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    link: lk(AppLink.DashboardCarLead),
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Service & Booking",
    description:
      "Book tid hos RTT, få tilbud på forsikring og bil, eller anmeld en skade. Alt samlet ét sted for din bekvemmelighed.",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    link: lk(AppLink.DashboardServiceBooking),
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    title: "Min Profil",
    description:
      "Administrer dine personlige oplysninger, indstillinger og præferencer. Hold din profil opdateret og tilpasset dine behov.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    link: lk(AppLink.DashboardProfile),
    gradient: "from-orange-500 to-red-500",
  },
];

export function DashboardPage(props: DashboardPageProps) {
  const { user, documentCount, compliance, news } = props;
  const progressColor = getProgressColor(compliance.level);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Velkommen, {user.name}!
        </h1>
        <p className="text-lg text-gray-600">
          Her er din oversigt over Gozy's funktioner og seneste nyheder
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                Dokumenter
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {documentCount}
              </p>
            </div>
            <svg
              className="w-12 h-12 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        <a
          href={lk(AppLink.DashboardDocuments)}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 no-underline hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">
                Dokumenter færdighed
              </p>
              <p className={`text-3xl font-bold ${progressColor}`}>
                {compliance.percentage}%
              </p>
              <p className="text-xs text-purple-700 mt-1">
                {compliance.uploadedCount} af {compliance.totalCount} uploadet
              </p>
            </div>
            <svg
              className="w-12 h-12 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </a>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                Seneste login
              </p>
              <p className="text-sm font-bold text-green-900">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString("da-DK", {
                      day: "numeric",
                      month: "short",
                    })
                  : "I dag"}
              </p>
            </div>
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Udforsk Gozy's funktioner
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {features.map((feature) => (
              <a
                key={feature.title}
                href={feature.link}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-transparent no-underline"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${feature.gradient}`}
                ></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d={feature.icon}
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Udforsk
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Seneste nyheder
              </h2>
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <div className="space-y-4">
              {news.length === 0 ? (
                <p className="text-gray-500 text-sm">Ingen nyheder endnu.</p>
              ) : (
                news.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 pb-4 ${index !== news.length - 1 ? "border-b border-gray-200" : ""}`}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {new Date(item.publishedAt).getDate()}
                      </span>
                      <span className="text-white text-xs uppercase">
                        {new Date(item.publishedAt).toLocaleDateString(
                          "da-DK",
                          {
                            month: "short",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.summary}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
