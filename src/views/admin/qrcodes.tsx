import type { QrCode, QrCodeScan } from "../../db/schema";
import type { HForm } from "../../services/hform/form";
import { lk, AppLink } from "../../lib/links";

type QrCodeWithStats = {
  id: number;
  shortCode: string;
  name: string;
  redirectUrl: string;
  createdAt: Date;
  updatedAt: Date;
  scanCount: number;
};

type QrCodesListViewProps = {
  qrCodes: QrCodeWithStats[];
  form: ReturnType<typeof HForm>;
  formData?: Record<string, unknown>;
  formErrors?: Record<string, string | undefined>;
};

export function QrCodesListView({
  qrCodes,
  form,
  formData,
  formErrors,
}: QrCodesListViewProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">QR Codes</h1>
        <p class="text-gray-400 mt-1">
          Create dynamic QR codes that can be updated after printing
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Create New QR Code</h2>
          {form.render(formData, formErrors)}
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Existing QR Codes</h2>

          {qrCodes.length === 0 ? (
            <div class="text-center py-8 text-gray-500">
              <p>No QR codes yet. Create your first one!</p>
            </div>
          ) : (
            <div class="space-y-3">
              {qrCodes.map((qrCode) => (
                <a
                  href={lk(AppLink.AdminQRCodeDetail, {
                    id: qrCode.shortCode,
                  })}
                  class="block p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-white truncate">
                        {qrCode.name}
                      </h3>
                      <p class="text-sm text-gray-400 mt-1">
                        /qr/{qrCode.shortCode}
                      </p>
                      <p class="text-xs text-gray-500 mt-1 truncate">
                        {qrCode.redirectUrl}
                      </p>
                    </div>
                    <div class="ml-4 flex-shrink-0 text-right">
                      <div class="text-sm font-medium text-blue-400">
                        {qrCode.scanCount}
                      </div>
                      <div class="text-xs text-gray-500">scans</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type QrCodeDetailViewProps = {
  qrCode: QrCode;
  qrCodeSvg: string;
  qrUrl: string;
  stats: {
    totalScans: number;
    recentScans: QrCodeScan[];
  };
  form: ReturnType<typeof HForm>;
  formValues?: Record<string, unknown>;
  formData?: Record<string, unknown>;
  formErrors?: Record<string, string | undefined>;
};

export function QrCodeDetailView({
  qrCode,
  qrCodeSvg,
  qrUrl,
  stats,
  form,
  formValues,
  formData,
  formErrors,
}: QrCodeDetailViewProps) {
  const values = formData ||
    formValues || {
      name: qrCode.name,
      redirectUrl: qrCode.redirectUrl,
    };

  return (
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <a
              href={lk(AppLink.AdminQRCodes)}
              class="text-sm text-gray-400 hover:text-gray-300 mb-2 inline-block"
            >
              ← Back to QR Codes
            </a>
            <h1 class="text-2xl font-bold">{qrCode.name}</h1>
            <p class="text-gray-400 mt-1">/qr/{qrCode.shortCode}</p>
          </div>
          <form
            method="post"
            action={lk(AppLink.AdminQRCodeDelete, {
              id: qrCode.shortCode,
            })}
            onsubmit="return confirm('Are you sure you want to delete this QR code? This action cannot be undone.')"
          >
            <button
              type="submit"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Delete QR Code
            </button>
          </form>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">QR Code</h2>

          <div
            class="bg-white p-4 rounded-lg flex items-center justify-center mb-4"
            dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
          />

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                QR Code URL
              </label>
              <div class="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-xs break-all font-mono">
                {qrUrl}
              </div>
            </div>

            <a
              href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCodeSvg)}`}
              download={`qr-${qrCode.shortCode}.svg`}
              class="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Download SVG
            </a>

            <div class="pt-3 border-t border-gray-800">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-400">Total Scans</span>
                <span class="text-xl font-bold text-blue-400">
                  {stats.totalScans}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 class="text-lg font-semibold mb-4">Edit QR Code</h2>
            {form.render(values, formErrors)}
          </div>

          {stats.recentScans.length > 0 && (
            <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 class="text-lg font-semibold mb-4">Recent Scans</h2>
              <div class="space-y-2">
                {stats.recentScans.map((scan) => (
                  <div class="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div class="flex-1 min-w-0">
                      {scan.country && (
                        <span class="text-sm text-gray-400">
                          {scan.country}
                        </span>
                      )}
                      {scan.userAgent && (
                        <p class="text-xs text-gray-500 mt-1 truncate">
                          {scan.userAgent}
                        </p>
                      )}
                    </div>
                    <div class="ml-4 text-xs text-gray-500 flex-shrink-0">
                      {new Date(scan.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
