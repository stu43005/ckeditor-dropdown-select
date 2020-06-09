import Command from '@ckeditor/ckeditor5-core/src/command';
import { isDropdown } from './utils';

export default class DropdownSelectOptionCommand extends Command {
  execute(value) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const element = selection.getSelectedElement();

    if (isDropdown(element)) {
      const options = element.getAttribute('options');
      const arr = String(options).split(',');

      if (arr.includes(value)) {
        model.change(writer => {
          writer.setAttribute('value', value, element);
        });
      }
    }
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const element = selection.getSelectedElement();
    this.isEnabled = isDropdown(element);

    if (!isDropdown(element) || !element.hasAttribute('value')) {
      this.value = null;
    } else {
      this.value = element.getAttribute('value');
    }
  }
}
