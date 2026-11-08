export type ActionToast = {
  description?: string;
  title: string;
  variant: 'danger' | 'success';
};

/**
 * Validation messages keyed by form field name.
 */
export type FieldErrors = Record<string, string>;

export type ActionResult =
  | {
      error: string;
      fieldErrors?: FieldErrors;
      ok: false;
      toasts?: ActionToast[];
    }
  | { ok: true; toasts?: ActionToast[] };
