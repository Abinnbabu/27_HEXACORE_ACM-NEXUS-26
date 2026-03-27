export const login = async (email, password) => {
  // Mock login implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ user: { role: 'user', email } });
    }, 1000);
  });
};

export const register = async (fullName, email, password) => {
  // Mock register implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, user: { fullName, email } });
    }, 1000);
  });
};

export const getRisk = async () => {
  const res = await fetch("/api/risk/");
  return res.json();
};

/**
 * Resolve lat/lon to a label + OpenStreetMap embed URL (see backend api/map_location.py).
 */
export const getLocationMap = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const res = await fetch(`/api/location/?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText || "Location lookup failed");
  }
  return res.json();
};
