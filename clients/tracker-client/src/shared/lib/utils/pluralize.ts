interface PluralForms {
  one: string;
  few: string;
  many: string;
}

function pluralize(count: number, forms: PluralForms): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;

  if (n > 10 && n < 20) return forms.many;
  if (n1 > 1 && n1 < 5) return forms.few;
  if (n1 === 1) return forms.one;
  return forms.many;
}

export { pluralize, type PluralForms };
