import type { ComplianceData } from "../../lib/compliance";
import { getProgressColor, getProgressGradient } from "../../lib/compliance";
import {
  getDocumentTypeIcon,
  getDocumentTypeLabel,
} from "../../lib/documentTypes";

type ComplianceScoreProps = {
  compliance: ComplianceData;
  showDetails?: boolean;
};

export function ComplianceScore({
  compliance,
  showDetails = true,
}: ComplianceScoreProps) {
  const { percentage, uploadedCount, totalCount, level, message } = compliance;
  const progressColor = getProgressColor(level);
  const progressGradient = getProgressGradient(level);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-start gap-6">
        <div className="relative flex-shrink-0">
          <svg className="transform -rotate-90" width="140" height="140">
            <circle
              cx="70"
              cy="70"
              r="54"
              stroke="#E5E7EB"
              stroke-width="12"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r="54"
              stroke={percentage === 100 ? "#16a34a" : "#2563eb"}
              stroke-width="12"
              fill="none"
              stroke-dasharray={circumference}
              stroke-dashoffset={strokeDashoffset}
              stroke-linecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {percentage}%
            </span>
            <span className="text-xs text-gray-500 mt-1">komplet</span>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dokumenter færdighed
          </h2>
          <p className="text-lg text-gray-700 mb-3">{message}</p>
          <p className="text-gray-600 mb-4">
            {uploadedCount} af {totalCount} dokumenttyper uploadet
          </p>

          {showDetails && (
            <details className="group">
              <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-medium inline-flex items-center gap-2">
                <span>Se alle dokumenttyper</span>
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from(compliance.uploadedTypes).map((docTypeValue) => (
                  <div
                    key={docTypeValue}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-green-600 flex items-center justify-center text-green-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-900 text-sm font-medium">
                      {getDocumentTypeIcon(docTypeValue)}{" "}
                      {getDocumentTypeLabel(docTypeValue)}
                    </span>
                  </div>
                ))}
                {compliance.missingTypes.map((docType) => (
                  <div
                    key={docType.value}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">
                      {docType.text}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              Fordele ved at uploade alle dokumenter:
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Automatiske påmindelser om udløbsdatoer
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Altid adgang til dine dokumenter, uanset hvor du er
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Vis hurtigt dine papirer ved kontroller
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
