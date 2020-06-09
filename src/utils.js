import { findOptimalInsertionPosition, isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

export const MODEL_NAME = 'dropdownSelect';
export const VIEW_CLASS_NAME = 'dropdown-select';

export const INSERT_COMMAND_NAME = 'insertDropdownSelect';
export const INSERT_COMPONENT_NAME = 'insertDropdownSelect';
export const OPTION_COMMAND_NAME = 'dropdownSelectOption';
export const OPTION_COMPONENT_NAME = 'dropdownSelectOption';

export function toDropdownWidget(viewElement, writer) {
  writer.setCustomProperty('dropdown-select', true, viewElement);

  return toWidget(viewElement, writer);
}

export function getSelectedDropdownViewWidget(selection) {
  const viewElement = selection.getSelectedElement();

  if (viewElement && isDropdownWidget(viewElement)) {
    return viewElement;
  }

  return null;
}

export function isDropdownWidget(viewElement) {
  return !!viewElement.getCustomProperty('dropdown-select') && isWidget(viewElement);
}

export function isDropdown(modelElement) {
  return !!modelElement && modelElement.is(MODEL_NAME);
}

export function insertDropdown(model, value, options, insertPosition) {
  model.change(writer => {
    const element = writer.createElement(MODEL_NAME, { value, options });

    model.insertContent(element, insertPosition);

    writer.setSelection(element, 'on');
  });
}

export function isDropdownAllowed(model) {
  const schema = model.schema;
  const selection = model.document.selection;

  return isDropdownAllowedInParent(selection, schema, model);
}

function isDropdownAllowedInParent(selection, schema, model) {
  return schema.findAllowedParent(selection.getFirstPosition(), MODEL_NAME) !== null;

  const parent = getInsertDropdownParent(selection, model);

  return schema.checkChild(parent, MODEL_NAME);
}

function checkSelectionOnObject(selection, schema) {
  const selectedElement = selection.getSelectedElement();

  return selectedElement && schema.isObject(selectedElement);
}

function isInOtherDropdown(selection) {
  return [...selection.focus.getAncestors()].every(ancestor => !ancestor.is(MODEL_NAME));
}

function getInsertDropdownParent(selection, model) {
  const insertAt = findOptimalInsertionPosition(selection, model);

  const parent = insertAt.parent;

  if (parent.isEmpty && !parent.is('$root')) {
    return parent.parent;
  }

  return parent;
}
