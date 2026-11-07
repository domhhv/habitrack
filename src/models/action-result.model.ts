export type ActionToast = {
  description?: string;
  title: string;
  variant: 'danger' | 'success';
};

export type ActionResult =
  | { error: string; ok: false; toasts?: ActionToast[] }
  | { ok: true; toasts?: ActionToast[] };
