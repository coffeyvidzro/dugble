export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

const LABELS: Record<PasswordStrengthScore, string> = {
  0: "Very weak",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

export function getPasswordStrength(password: string): {
  score: PasswordStrengthScore;
  label: string;
} {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as PasswordStrengthScore;
  return { score: clamped, label: password ? LABELS[clamped] : "" };
}
