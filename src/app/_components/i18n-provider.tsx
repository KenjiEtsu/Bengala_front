"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type Locale = "es" | "en";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof MESSAGES["es"]) => string;
};

const STORAGE_KEY = "bengala.locale.v1";

const MESSAGES = {
  es: {
    app_pwa: "PWA · prototipo",
    start: "Iniciar",
    home_open_tracking: "Abrir tracking",
    home_start_now: "Empezar ahora",
    home_title: "Una señal de auxilio y protección.",
    home_body:
      "Bengala permite compartir ubicación en tiempo real, guardar un rastro (migas de pan) incluso sin cobertura y activar una alerta de emergencia.",
    feature_location: "Ubicación",
    feature_location_body:
      "Comparte posición y rastro con personas de confianza y Superacció.",
    feature_offline: "Offline-first",
    feature_offline_body:
      "Guarda ubicaciones sin cobertura y sincroniza al recuperar conexión.",
    feature_emergency: "Emergencia",
    feature_emergency_body: "Botón rojo para alertar y guiar acciones inmediatas.",
    nav_home: "Inicio",
    nav_trip: "Viaje",
    nav_tracking: "Tracking",
    nav_info: "Info",
    nav_account: "Cuenta",
    nav_aria: "Navegación",
    trip_title: "Viaje",
    trip_map: "Mapa",
    trip_map_body: "Ubicación actual y ruta recorrida en este dispositivo.",
    trip_share: "Compartir",
    trip_share_body:
      "Genera un enlace para que familiares/personas de confianza vean tu última ubicación y el rastro.",
    controls: "Controles",
    location: "Ubicación",
    ready_to_start: "Listo para iniciar tracking.",
    connectivity: "Conexión",
    no_connection: "Sin conexión",
    tracking_stopped: "Tracking detenido",
    resuming: "Reanudando…",
    gps_error: "Error GPS",
    geo_unsupported: "Geolocalización no disponible en este dispositivo.",
    create_link: "Crear enlace",
    creating_link: "Creando enlace…",
    share: "Compartir",
    copy_link: "Copiar enlace",
    open: "Abrir",
    delete_link: "Borrar enlace",
    need_login: "Inicia sesión para crear un viaje.",
    tracking_start: "Iniciar tracking",
    tracking_active: "Tracking activo",
    tracking_resume: "Reanudar tracking",
    tracking_stop: "Detener tracking",
    sos: "SOS",
    account_title: "Cuenta",
    account_body: "Necesaria para crear un viaje y generar enlace compartible.",
    go_trip: "Ir a Viaje",
    logged_in: "Sesión iniciada",
    logout: "Cerrar sesión",
    access: "Acceso",
    register: "Crear cuenta",
    login: "Entrar",
    processing: "Procesando…",
    email: "Email",
    username: "Nombre de usuario (único)",
    password: "Contraseña",
    pwd_hint:
      "Contraseña mínima: 10 caracteres. Username: 3–20, solo a-z, 0-9 y _.",
    pick_username: "Elige un nombre de usuario para registrarte.",
    bad_username: "Username inválido: usa 3–20 caracteres a-z, 0-9 o _.",
    documents: "Documentación",
    docs_body:
      "Sube copias digitales (se guardan cifradas en el servidor). No se muestran en pantalla; solo se descargan como archivo.",
    refresh_list: "Actualizar lista",
    download: "Descargar",
    delete: "Borrar",
    no_docs: "No hay documentos subidos.",
    tracking_shared: "Tracking compartido",
    lookup_body:
      "Pega un usuario, token o enlace para ver la ubicación y el historial.",
    open_by_token: "Abrir por token",
    token_help:
      "El token viene dentro del enlace compartido. Puedes pegarlo tal cual o pegar el enlace completo.",
    open_btn: "Abrir",
    checking: "Comprobando…",
    not_found: "No se encontró ese usuario/token.",
    history: "Historial",
    history_body: "Tokens abiertos recientemente en este dispositivo.",
    clear_history: "Borrar historial",
    remove: "Quitar",
    location_of: "Ubicación de",
    auto_updates: "Se actualiza automáticamente.",
    change_user: "Cambiar usuario",
    update: "Actualizar",
    map: "Mapa",
    map_route_last: "Ruta y última posición disponible.",
    last_signal: "Última señal",
    loading: "Cargando…",
    points: "Puntos",
    ok: "OK",
    error_generic: "Error"
    ,
    info_title: "Información por destino",
    info_body:
      "Información importante en formato tipo mapa: país → región → ciudad. (Placeholder por ahora)",
    info_breadcrumbs: "Ruta",
    info_select: "Seleccionar destino",
    info_search_placeholder: "Buscar país, comunidad o provincia…",
    info_search_results: "Resultados de búsqueda",
    info_destination: "Destino",
    info_placeholder: "Contenido pendiente de completar y validar.",
    info_todo: "Placeholder: por definir con fuentes oficiales y actualización.",
    info_children: "Subdestinos",
    info_navigation: "Navegación",
    info_back: "Atrás",
    info_aria_map: "Mapa de destinos",
    info_aria_sections: "Secciones informativas",
    info_aria_children: "Subdestinos"
  },
  en: {
    app_pwa: "PWA · prototype",
    start: "Start",
    home_open_tracking: "Open tracking",
    home_start_now: "Start now",
    home_title: "A signal for help and protection.",
    home_body:
      "Bengala lets you share location in real time, keep a breadcrumb trail even offline, and trigger an emergency alert.",
    feature_location: "Location",
    feature_location_body: "Share position and trail with trusted people and Superacció.",
    feature_offline: "Offline-first",
    feature_offline_body: "Store locations without coverage and sync when back online.",
    feature_emergency: "Emergency",
    feature_emergency_body: "Red button to alert and guide immediate actions.",
    nav_home: "Home",
    nav_trip: "Trip",
    nav_tracking: "Tracking",
    nav_info: "Info",
    nav_account: "Account",
    nav_aria: "Navigation",
    trip_title: "Trip",
    trip_map: "Map",
    trip_map_body: "Current location and route on this device.",
    trip_share: "Share",
    trip_share_body:
      "Generate a link so trusted people can see your last location and trail.",
    controls: "Controls",
    location: "Location",
    ready_to_start: "Ready to start tracking.",
    connectivity: "Connectivity",
    no_connection: "Offline",
    tracking_stopped: "Tracking stopped",
    resuming: "Resuming…",
    gps_error: "GPS error",
    geo_unsupported: "Geolocation is not available on this device.",
    create_link: "Create link",
    creating_link: "Creating link…",
    share: "Share",
    copy_link: "Copy link",
    open: "Open",
    delete_link: "Delete link",
    need_login: "Sign in to create a trip.",
    tracking_start: "Start tracking",
    tracking_active: "Tracking active",
    tracking_resume: "Resume tracking",
    tracking_stop: "Stop tracking",
    sos: "SOS",
    account_title: "Account",
    account_body: "Required to create a trip and generate a share link.",
    go_trip: "Go to Trip",
    logged_in: "Signed in",
    logout: "Sign out",
    access: "Access",
    register: "Create account",
    login: "Sign in",
    processing: "Processing…",
    email: "Email",
    username: "Username (unique)",
    password: "Password",
    pwd_hint:
      "Password min: 10 characters. Username: 3–20, only a-z, 0-9 and _.",
    pick_username: "Choose a username to register.",
    bad_username: "Invalid username: use 3–20 characters a-z, 0-9 or _.",
    documents: "Documents",
    docs_body:
      "Upload copies (stored encrypted on the server). They are not previewed; only downloaded as files.",
    refresh_list: "Refresh list",
    download: "Download",
    delete: "Delete",
    no_docs: "No documents uploaded.",
    tracking_shared: "Shared tracking",
    lookup_body: "Paste a username, token or link to view someone’s location and history.",
    open_by_token: "Open by token",
    token_help: "The token is inside the shared link. You can paste the token or the full link.",
    open_btn: "Open",
    checking: "Checking…",
    not_found: "User/token not found.",
    history: "History",
    history_body: "Recently opened tokens on this device.",
    clear_history: "Clear history",
    remove: "Remove",
    location_of: "Location of",
    auto_updates: "Auto-updates.",
    change_user: "Change user",
    update: "Update",
    map: "Map",
    map_route_last: "Route and last known position.",
    last_signal: "Last signal",
    loading: "Loading…",
    points: "Points",
    ok: "OK",
    error_generic: "Error"
    ,
    info_title: "Destination info",
    info_body:
      "Important info in a map-like hierarchy: country → region → city. (Placeholder for now)",
    info_breadcrumbs: "Path",
    info_select: "Select destination",
    info_search_placeholder: "Search country, region or province…",
    info_search_results: "Search results",
    info_destination: "Destination",
    info_placeholder: "Content pending to be completed and validated.",
    info_todo: "Placeholder: to be defined with official sources and updates.",
    info_children: "Sub-destinations",
    info_navigation: "Navigation",
    info_back: "Back",
    info_aria_map: "Destinations map",
    info_aria_sections: "Information sections",
    info_aria_children: "Sub-destinations"
  }
} as const;

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLocale(input: string | null): Locale {
  if (input === "en") return "en";
  return "es";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const stored = normalizeLocale(localStorage.getItem(STORAGE_KEY));
    setLocaleState(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("bengala:locale"));
  }, []);

  const t = useCallback(
    (key: keyof typeof MESSAGES["es"]) => MESSAGES[locale][key],
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
