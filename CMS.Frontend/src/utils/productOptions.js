import { formatCurrency } from './formatCurrency';

export const normalizeText = (value = '') => value
  .toString()
  .normalize('NFC')
  .toLowerCase()
  .trim()
  .replace(/[()]/g, '')
  .replace(/\s+/g, ' ');

const normalizeOptionValues = (values = []) => values.map((value) => ({
  id: Number(value.id),
  name: value.name || '',
  priceSurcharge: Number(value.priceSurcharge || 0),
  stockQuantity: value.stockQuantity
}));

export const normalizeOptionGroups = (groups = []) => groups.map((group) => ({
  id: Number(group.id),
  name: group.name || '',
  isRequired: Boolean(group.isRequired),
  maxSelectable: Number(group.maxSelectable || 1),
  optionValues: normalizeOptionValues(group.optionValues || group.OptionValues || [])
}));

export const isSizeOptionGroup = (group) => {
  const groupName = normalizeText(group?.name || '');
  return groupName.includes('size') || groupName.includes('kich co') || groupName.includes('kích cỡ');
};

const getProductNameEndCandidates = (productName = '') => {
  const rawName = productName.toString().trim();
  const parenthesizedMatch = rawName.match(/\(([^)]+)\)\s*$/);
  const dashedMatch = rawName.match(/[-–—]\s*([^\-–—()]+)\s*$/);
  const tokens = rawName.split(/\s+/).filter(Boolean);

  return [
    parenthesizedMatch?.[1],
    dashedMatch?.[1],
    tokens.at(-1)
  ].filter(Boolean).map(normalizeText);
};

export const findCurrentOptionFromProductName = (productName, group) => {
  if (!isSizeOptionGroup(group)) return null;

  const nameCandidates = getProductNameEndCandidates(productName);
  if (nameCandidates.length === 0) return null;

  return group.optionValues.find((optionValue) => (
    nameCandidates.includes(normalizeText(optionValue.name))
  )) || null;
};

const getFirstAvailableOption = (group) => (
  group.optionValues.find((value) => value.stockQuantity !== 0) || null
);

export const buildDefaultSelections = (groups = [], productName = '') => groups.reduce((selectionMap, group) => {
  const currentSizeOption = findCurrentOptionFromProductName(productName, group);
  const defaultOption = currentSizeOption || (group.isRequired ? getFirstAvailableOption(group) : null);

  if (!defaultOption) return selectionMap;

  return {
    ...selectionMap,
    [group.id]: [defaultOption.id]
  };
}, {});

export const getAdjustedOptionSurcharge = (optionValue, group, productName = '') => {
  if (!isSizeOptionGroup(group)) return Number(optionValue?.priceSurcharge || 0);

  const currentOption = findCurrentOptionFromProductName(productName, group);
  if (!currentOption) return Number(optionValue?.priceSurcharge || 0);

  return Number(optionValue?.priceSurcharge || 0) - Number(currentOption.priceSurcharge || 0);
};

export const formatOptionDelta = (amount = 0) => {
  const normalizedAmount = Number(amount || 0);
  if (normalizedAmount === 0) return '0 đ';

  const sign = normalizedAmount > 0 ? '+' : '-';
  return `${sign} ${formatCurrency(Math.abs(normalizedAmount))}`;
};

export const getSelectedOptionValuesWithGroups = (groups = [], selectedOptions = {}) => groups.flatMap((group) => {
  const selectedIds = selectedOptions[group.id] || [];
  return group.optionValues
    .filter((optionValue) => selectedIds.includes(optionValue.id))
    .map((optionValue) => ({ optionValue, group }));
});

export const getAdjustedOptionTotal = (groups = [], selectedOptions = {}, productName = '') => (
  getSelectedOptionValuesWithGroups(groups, selectedOptions).reduce((total, { optionValue, group }) => (
    total + getAdjustedOptionSurcharge(optionValue, group, productName)
  ), 0)
);
