/** The rule, as shown beside the field. */
export const USERNAME_RULE = '3 to 20 letters, numbers or underscores';

/**
 * What the field holds while typing: lowercase, no spaces and no leading @
 * (the @ is drawn beside the field and never sent).
 */
export function typedUsername(value: string) {
  return value.replace(/\s+/g, '').replace(/^@+/, '').toLowerCase().slice(0, 20);
}

/** A sentence when the handle breaks the rule, otherwise `null`. */
export function usernameProblem(value: string) {
  return /^[a-z0-9_]{3,20}$/.test(value) ? null : `Use ${USERNAME_RULE}.`;
}
