import { AppLink, lk, WHATSAPP_CONTACT_URL } from "../../lib/links";

export function SignupPage() {
  return (
    <div class="p-8 lg:my-12 max-w-lg mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Opret din konto via WhatsApp
        </h1>
        <p class="text-gray-600">
          For at komme i gang med Gozy skal du først skrive til os på WhatsApp.
        </p>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">
          Kom i gang i 3 trin:
        </h2>
        <ol class="space-y-3 text-gray-700">
          <li class="flex items-start">
            <span class="font-bold text-blue-600 mr-3">1.</span>
            <span>Scan QR-koden nedenfor eller klik pa linket</span>
          </li>
          <li class="flex items-start">
            <span class="font-bold text-blue-600 mr-3">2.</span>
            <span>Send en besked til Gozy pa WhatsApp</span>
          </li>
          <li class="flex items-start">
            <span class="font-bold text-blue-600 mr-3">3.</span>
            <span>Kom tilbage her og log ind med dit telefonnummer</span>
          </li>
        </ol>
      </div>

      <div class="text-center mb-6">
        <a
          href={WHATSAPP_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition no-underline"
        >
          <svg
            class="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Skriv til Gozy på WhatsApp
        </a>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-600 mb-3">Har du allerede en konto?</p>
        <a
          href={lk(AppLink.Login)}
          class="text-blue-600 hover:text-blue-700 font-medium"
        >
          Log ind her
        </a>
      </div>
    </div>
  );
}
