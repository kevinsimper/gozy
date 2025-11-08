export enum AppLink {
  Root = "/",
  Login = "/login",
  Signup = "/signup",
  LoginVerify = "/login/verify",
  Logout = "/logout",
  Users = "/users",
  Gemini = "/gemini",
  Dashboard = "/dashboard",
  DashboardDocuments = "/dashboard/documents",
  DashboardDocumentsUpload = "/dashboard/documents/upload",
  DashboardDocumentsPreview = "/dashboard/documents/:publicId/preview",
  DashboardDocumentsDelete = "/dashboard/documents/:publicId/delete",
  DashboardChat = "/dashboard/chat",
  DashboardProfile = "/dashboard/profile",
  ApiWhatsapp = "/api/whatsapp",
  Files = "/files/:publicId",
  AdminDashboard = "/admin",
  AdminDocuments = "/admin/documents",
}

type RouteParams = {
  publicId?: string;
  query?: Record<string, string>;
};

type IncludesParam<T extends string> = T extends `${string}:${string}`
  ? true
  : false;

type LinksWithParams = {
  [K in keyof typeof AppLink]: (typeof AppLink)[K] extends string
    ? IncludesParam<(typeof AppLink)[K]> extends true
      ? K
      : never
    : never;
}[keyof typeof AppLink];

type LinksWithoutParams = Exclude<keyof typeof AppLink, LinksWithParams>;

export function lk(
  link: (typeof AppLink)[LinksWithoutParams],
  params?: { query?: Record<string, string> },
): string;
export function lk<
  L extends LinksWithParams,
  P extends RouteParams = Required<RouteParams>,
>(link: (typeof AppLink)[L], params: P): string;

export function lk(
  linkValue: AppLink,
  params?: RouteParams & { query?: Record<string, string> },
): string {
  let path: string = linkValue;

  if (params) {
    if (params.publicId) {
      path = path.replace(":publicId", params.publicId);
    }

    if (params.query) {
      const queryString = new URLSearchParams(params.query).toString();
      if (queryString) {
        path = `${path}?${queryString}`;
      }
    }
  }

  if (path.includes(":")) {
    console.warn(
      `Warning: URL ${linkValue} generated as ${path} still contains parameters. Did you forget to provide them?`,
    );
  }

  return path;
}
