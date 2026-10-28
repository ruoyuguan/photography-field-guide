function initialize(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('[data-filter-form]');
  const query = root.querySelector<HTMLInputElement>('[data-filter-query]');
  if (!form || !query) return;
  const selects = [
    ...root.querySelectorAll<HTMLSelectElement>('[data-filter-key]'),
  ];
  const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
  const results = root.querySelector<HTMLElement>('[data-filter-results]');
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const apply = () => {
    const needle = query.value.trim().toLocaleLowerCase();
    let shown = 0;
    for (const item of items) {
      const matchesQuery =
        !needle ||
        (item.dataset.search ?? '').toLocaleLowerCase().includes(needle);
      const matchesFilters = selects.every(select => {
        const expected = select.value;
        return (
          !expected ||
          (item.dataset[select.dataset.filterKey ?? ''] ?? '')
            .split(' ')
            .includes(expected)
        );
      });
      item.hidden = !(matchesQuery && matchesFilters);
      if (!item.hidden) shown += 1;
    }
    if (results)
      results.textContent = (root.dataset.showing ?? '{shown} / {total}')
        .replace('{shown}', String(shown))
        .replace('{total}', String(items.length));
    if (empty) empty.hidden = shown !== 0;
  };
  form.hidden = false;
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('reset', () => requestAnimationFrame(apply));
  apply();
}

export function initializeDirectoryFilters(): void {
  const mount = () =>
    document.querySelectorAll<HTMLElement>('[data-directory]').forEach(root => {
      if (root.dataset.initialized === 'true') return;
      root.dataset.initialized = 'true';
      initialize(root);
    });
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
  document.addEventListener('astro:page-load', mount);
}
