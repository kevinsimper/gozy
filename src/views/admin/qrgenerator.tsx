type QRGeneratorProps = {
  qrCodeSvg?: string;
  message?: string;
  phoneNumber: string;
};

export function QRGeneratorView({
  qrCodeSvg,
  message = "",
  phoneNumber,
}: QRGeneratorProps) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">QR Code Generator</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Generate QR Code</h2>

          <form method="post" class="space-y-4">
            <div>
              <label
                for="phoneNumber"
                class="block text-sm font-medium text-gray-300 mb-2"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                placeholder="4520429116"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p class="mt-1 text-xs text-gray-500">
                WhatsApp number without + or spaces (e.g., 4520429116)
              </p>
            </div>

            <div>
              <label
                for="message"
                class="block text-sm font-medium text-gray-300 mb-2"
              >
                Message
              </label>
              <input
                type="text"
                id="message"
                name="message"
                value={message}
                placeholder="Check in"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p class="mt-1 text-xs text-gray-500">
                This message will be pre-filled in WhatsApp
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                WhatsApp URL Preview
              </label>
              <div class="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-xs break-all font-mono">
                {whatsappUrl}
              </div>
            </div>

            <button
              type="submit"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Generate QR Code
            </button>
          </form>
        </div>

        {/* QR Code Display Section */}
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">QR Code</h2>

          {qrCodeSvg ? (
            <div class="space-y-4">
              <div
                class="bg-white p-4 rounded-lg flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              />

              <div class="space-y-2">
                <a
                  href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCodeSvg)}`}
                  download={`qr-code-${message.replace(/\s+/g, "-").toLowerCase() || "whatsapp"}.svg`}
                  class="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Download SVG
                </a>

                <p class="text-xs text-gray-500 text-center">
                  SVG format is scalable and perfect for printing
                </p>
              </div>
            </div>
          ) : (
            <div class="bg-gray-800 border border-gray-700 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-12 w-12 mb-3"
              >
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                <path d="M21 21v.01" />
                <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M3 12h.01" />
                <path d="M12 3h.01" />
                <path d="M12 16v.01" />
                <path d="M16 12h1" />
                <path d="M21 12v.01" />
                <path d="M12 21v-1" />
              </svg>
              <p class="text-sm">Enter a message and click Generate</p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic QR Codes Notice */}
      <div class="mt-6 bg-blue-900/20 border border-blue-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-3 text-blue-400">
          Need a QR code you can update later?
        </h2>
        <p class="text-sm text-gray-300 mb-3">
          This generator creates static QR codes that cannot be changed after
          printing. If you need to update the destination URL later, use our
          dynamic QR code system instead.
        </p>
        <a
          href="/admin/qr-codes"
          class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          Manage Dynamic QR Codes →
        </a>
      </div>

      {/* Usage Instructions */}
      <div class="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-3">Usage Instructions</h2>
        <ul class="space-y-2 text-sm text-gray-300">
          <li class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Generate a QR code with a pre-filled message for drivers
          </li>
          <li class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Download the SVG file and print it for RTT locations
          </li>
          <li class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            When scanned, the QR code opens WhatsApp with the message pre-filled
          </li>
          <li class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            SVG format can be scaled to any size without losing quality
          </li>
        </ul>
      </div>
    </div>
  );
}
