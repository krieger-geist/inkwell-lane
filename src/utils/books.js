function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function categorySummary(books) {
  const categories = new Map();
  for (const book of books) {
    const name = typeof book.category === 'string' ? book.category.trim() : '';
    if (!name) continue;
    const key = name.toLowerCase();
    if (!categories.has(key)) categories.set(key, { name, count: 0 });
    categories.get(key).count += 1;
  }
  return [...categories.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

module.exports = { escapeRegex, categorySummary };
