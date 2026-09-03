export function findDuplicates(users) {
  const pairs = [];

  for (let i = 0; i < users.length; i += 1) {
    for (let j = i + 1; j < users.length; j += 1) {
      const left = users[i];
      const right = users[j];

      const leftEmail = normalizeEmail(left.email);
      const rightEmail = normalizeEmail(right.email);

      const leftName = normalizeName(left.name);
      const rightName = normalizeName(right.name);

      const sameNormalizedEmail =
        leftEmail.length > 0 &&
        rightEmail.length > 0 &&
        leftEmail === rightEmail;

      const sameDomain =
        emailDomain(leftEmail) &&
        emailDomain(leftEmail) === emailDomain(rightEmail);

      const nameSimilarity = similarity(leftName, rightName);

      const likelyDuplicate =
        sameNormalizedEmail ||
        (sameDomain && nameSimilarity >= 0.8);

      if (likelyDuplicate) {
        pairs.push({
          ids: [left._id, right._id],
          reason: sameNormalizedEmail ? 'email' : 'name-and-domain',
          score: sameNormalizedEmail ? 1 : Number(nameSimilarity.toFixed(3))
        });
      }
    }
  }

  return pairs;
}

function normalizeEmail(email) {
  const [local = '', domain = ''] = String(email || '').trim().toLowerCase().split('@');
  const withoutTag = local.split('+')[0];
  return `${withoutTag.replace(/\./g, '')}@${domain}`;
}

function emailDomain(email) {
  const index = email.lastIndexOf('@');
  return index === -1 ? '' : email.slice(index + 1);
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + cost
      );

      diagonal = above;
    }
  }

  return 1 - previous[b.length] / Math.max(a.length, b.length);
}
