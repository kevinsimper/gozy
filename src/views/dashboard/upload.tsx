import { AppLink, lk } from "../../lib/links";

export function UploadPage() {
  return (
    <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <div style="margin-bottom: 2rem;">
        <a
          href={lk(AppLink.DashboardDocuments)}
          style="color: #2563eb; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem;"
        >
          <svg
            style="width: 1.25rem; height: 1.25rem;"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Tilbage til dokumenter
        </a>
      </div>

      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem;">
        Upload Document
      </h1>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 2rem;">
        <form
          method="post"
          action={lk(AppLink.DashboardDocumentsUpload)}
          enctype="multipart/form-data"
          style="display: flex; flex-direction: column; gap: 1.5rem;"
        >
          <div>
            <label
              for="file"
              style="display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.875rem; color: #374151;"
            >
              Choose File
            </label>
            <input
              type="file"
              name="file"
              id="file"
              required
              style="display: block; width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;"
            />
            <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
              Maximum file size: 10MB. AI will automatically detect document
              type and expiry date.
            </p>
          </div>

          <div style="display: flex; gap: 1rem;">
            <button
              type="submit"
              style="background: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; font-size: 0.875rem;"
            >
              Upload Document
            </button>
            <a
              href={lk(AppLink.DashboardDocuments)}
              style="background: #f3f4f6; color: #374151; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; font-size: 0.875rem;"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
