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
  const res = await fetch("http://127.0.0.1:8000/api/risk/");
  return res.json();
};
