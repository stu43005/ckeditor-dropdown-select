import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import DropdownFormView from './ui/dropdown-form-view';
import { INSERT_COMMAND_NAME, INSERT_COMPONENT_NAME, isDropdown, OPTION_COMMAND_NAME, OPTION_COMPONENT_NAME } from './utils';

export default class DropdownSelectUI extends Plugin {
  init() {
    this._createInsertButton();
    this._createOptionButton();
  }

  _createInsertButton() {
    const editor = this.editor;
    const command = editor.commands.get(INSERT_COMMAND_NAME);

    editor.ui.componentFactory.add(INSERT_COMPONENT_NAME, locale => {
      const dropdownView = createDropdown(locale);
      const dropdownForm = new DropdownFormView(editor.locale);

      this._setUpDropdown(dropdownView, dropdownForm, command, editor);
      this._setUpForm(dropdownView, dropdownForm, command);

      return dropdownView;
    });
  }

  _setUpDropdown(dropdown, form, command) {
    const editor = this.editor;
    const t = editor.t;
    const button = dropdown.buttonView;

    dropdown.bind('isEnabled').to(command);
    dropdown.panelView.children.add(form);

    button.set({
      label: t('Dropdown'),
      tooltip: true,
      withText: true
    });

    button.on('open', () => {
      form.open(command.value);
    }, { priority: 'low' });

    dropdown.on('submit', () => {
      if (form.isValid()) {
        editor.execute(INSERT_COMMAND_NAME, form.value);
        closeUI();
      }
    });

    dropdown.on('change:isOpen', () => form.resetFormStatus());
    dropdown.on('cancel', () => closeUI());

    function closeUI() {
      editor.editing.view.focus();
      dropdown.isOpen = false;
    }
  }

  _setUpForm(dropdown, form, command) {
    form.delegate('submit', 'cancel').to(dropdown);
    form.inputView.bind('value').to(command, 'value');

    // Form elements should be read-only when corresponding commands are disabled.
    form.inputView.bind('isReadOnly').to(command, 'isEnabled', value => !value);
    form.saveButtonView.bind('isEnabled').to(command);
  }


  _createOptionButton() {
    const editor = this.editor;
    const command = editor.commands.get(OPTION_COMMAND_NAME);

    editor.ui.componentFactory.add(OPTION_COMPONENT_NAME, locale => {
      const dropdownView = createDropdown(locale);

      this._setUpOptionDropdown(dropdownView, command);

      return dropdownView;
    });
  }

  _setUpOptionDropdown(dropdown, command) {
    const editor = this.editor;
    const t = editor.t;
    const button = dropdown.buttonView;

    dropdown.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');

    button.set({
      tooltip: true,
      withText: true
    });
    button.bind('label').to(command, 'value', value => {
      return value || t('Options');
    });

    button.on('open', () => {
      this._setUpOptions(dropdown);
    }, { priority: 'low' });

    this.listenTo(dropdown, 'execute', evt => {
      editor.execute(OPTION_COMMAND_NAME, evt.source.commandParam);
      editor.editing.view.focus();
    });
  }

  _setUpOptions(dropdown) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const element = selection.getSelectedElement();

    dropdown.panelView.children.clear();

    if (isDropdown(element)) {
      const options = element.getAttribute('options');
      const arr = String(options).split(',');
      addListToDropdown(dropdown, getDropdownItemsDefinitions(arr));
    }
  }

}

function getDropdownItemsDefinitions(options) {
  const itemDefinitions = new Collection();

  for (const name of options) {
    const definition = {
      type: 'button',
      model: new Model({
        commandParam: name,
        label: name,
        withText: true
      })
    };

    // Add the item definition to the collection.
    itemDefinitions.add(definition);
  }

  return itemDefinitions;
}
