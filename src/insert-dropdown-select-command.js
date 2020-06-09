import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertDropdown, isDropdownAllowed, isDropdown } from './utils';

export default class InsertDropdownSelectCommand extends Command {
  execute(options) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const element = selection.getSelectedElement();

    const arr = String(options).split(',');
    const value = arr[0];

    if (isDropdown(element)) {
      model.change(writer => {
        const oldValue = element.getAttribute('value');
        if (!arr.includes(oldValue)) {
          writer.setAttribute('value', value, element);
        }
        writer.setAttribute('options', options, element);
      });

    } else {
      insertDropdown(model, value, options, selection);
    }
  }

  refresh() {
    this.isEnabled = isDropdownAllowed(this.editor.model);

    const element = this.editor.model.document.selection.getSelectedElement();
    if (!isDropdown(element) || !element.hasAttribute('options')) {
      this.value = null;
    } else {
      this.value = element.getAttribute('options');
    }
  }
}
