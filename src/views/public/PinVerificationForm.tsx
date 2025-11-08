import { ErrorMessage } from "./ErrorMessage";
import { AppLink, lk } from "../../lib/links";

interface PinVerificationFormProps {
  phoneNumber: string;
  error?: string;
}

export function PinVerificationForm(props: PinVerificationFormProps) {
  return (
    <div class="bg-white rounded-lg shadow-lg p-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Indtast PIN-kode</h1>
        <p class="text-gray-600">
          En 4-cifret PIN-kode er sendt til din WhatsApp
        </p>
        <p class="text-sm text-gray-500 mt-2">Koden udløber om 10 minutter</p>
      </div>

      {props.error && <ErrorMessage message={props.error} />}

      <form method="post" action={lk(AppLink.LoginVerify)}>
        <input type="hidden" name="phoneNumber" value={props.phoneNumber} />

        <div class="mb-6">
          <label for="pin" class="block text-sm font-medium text-gray-700 mb-2">
            PIN-kode
          </label>
          <input
            type="text"
            id="pin"
            name="pin"
            placeholder="1234"
            maxlength={4}
            pattern="[0-9]{4}"
            required
            autofocus
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-center text-2xl tracking-widest font-mono"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition"
        >
          Log ind
        </button>
      </form>

      <div class="mt-6 text-center">
        <a
          href={lk(AppLink.Login)}
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Anmod om ny kode
        </a>
      </div>
    </div>
  );
}
