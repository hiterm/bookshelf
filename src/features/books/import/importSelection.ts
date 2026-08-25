export const updateVisibleSelection = (
  selectedIndexes: ReadonlySet<number>,
  visibleIndexes: readonly number[],
  selected: boolean,
): Set<number> => {
  const next = new Set(selectedIndexes);
  for (const index of visibleIndexes) {
    if (selected) next.add(index);
    else next.delete(index);
  }
  return next;
};
