import { ErrorMessage } from "./ErrorMessage";

interface LoginFormProps {
  error?: string;
  phoneNumber?: string;
}

export function LoginForm(props: LoginFormProps) {
  return (
    <div class="p-8 max-w-md mx-auto">
      <div class="mb-6">
        <p class="text-gray-600 text-center text-lg font-semibold">
          Log ind med dit telefonnummer
        </p>
      </div>

      {props.error && <ErrorMessage message={props.error} />}

      <form method="post" action="/login">
        <div class="mb-6">
          <label
            for="phoneNumber"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Telefonnummer
          </label>
          <div class="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
            <span class="px-4 py-3 text-gray-700 font-medium bg-gray-50 border-r border-gray-300">
              +45
            </span>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="12345678"
              value={
                props.phoneNumber ? props.phoneNumber.replace("+45", "") : ""
              }
              required
              pattern="[0-9]{8}"
              class="flex-1 px-4 py-3 rounded-r-lg outline-none"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">Indtast 8 cifre</p>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition"
        >
          Send PIN-kode
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Du vil modtage en 4-cifret PIN-kode via WhatsApp
        </p>
      </div>
    </div>
  );
}
