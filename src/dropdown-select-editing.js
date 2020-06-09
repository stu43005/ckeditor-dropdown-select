import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import DropdownSelectOptionCommand from './dropdown-select-option-command';
import '../theme/dropdown-select.scss';
import InsertDropdownSelectCommand from './insert-dropdown-select-command';
import { INSERT_COMMAND_NAME, MODEL_NAME, OPTION_COMMAND_NAME, OPTION_COMPONENT_NAME, toDropdownWidget, VIEW_CLASS_NAME } from './utils';

export default class DropdownSelectEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    console.log('DropdownSelectEditing#init() got called');

    this.editor.config.define('dropdownSelect', {
      toolbar: [
        OPTION_COMPONENT_NAME,
      ],
    });

    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add(OPTION_COMMAND_NAME, new DropdownSelectOptionCommand(this.editor));
    this.editor.commands.add(INSERT_COMMAND_NAME, new InsertDropdownSelectCommand(this.editor));

    this.editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass(VIEW_CLASS_NAME))
    );
  }

  afterInit() {
    if (this.editor.plugins.has('RestrictedEditingModeEditing')) {
      const restrictedEditingModeEditing = this.editor.plugins.get('RestrictedEditingModeEditing');
      restrictedEditingModeEditing.enableCommand(OPTION_COMMAND_NAME);
    }
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register(MODEL_NAME, {
      allowAttributes: ['value', 'options'],
      allowWhere: '$text',
      isInline: true,
      isObject: true,
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;

    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: [VIEW_CLASS_NAME]
      },
      model: (viewElement, modelWriter) => {
        const value = viewElement.getChild(0).data;
        const options = viewElement.getAttribute('data-options');

        return modelWriter.createElement(MODEL_NAME, { value, options });
      }
    });

    conversion.for('editingDowncast').elementToElement({
      model: MODEL_NAME,
      view: (modelItem, viewWriter) => {
        const widgetElement = createDropdownView(modelItem, viewWriter);
        return toDropdownWidget(widgetElement, viewWriter);
      }
    });

    conversion.for('dataDowncast').elementToElement({
      model: MODEL_NAME,
      view: createDropdownView
    });

    conversion.for('downcast')
      .add(valueAttributeConverter())
      .add(optionsAttributeConverter());
  }
}

// Helper method for both downcast converters.
function createDropdownView(modelItem, viewWriter) {
  const dropdownView = viewWriter.createContainerElement('span', {
    class: VIEW_CLASS_NAME
  });

  return dropdownView;
}

function valueAttributeConverter() {
  return dispatcher => {
    dispatcher.on(`attribute:value:${MODEL_NAME}`, converter);
  };

  function converter(evt, data, conversionApi) {
    if (!conversionApi.consumable.consume(data.item, evt.name)) {
      return;
    }

    const viewWriter = conversionApi.writer;
    const element = conversionApi.mapper.toViewElement(data.item);

    const innerText = element.getChild(0);
    if (innerText) {
      viewWriter.remove(innerText);
    }

    if (data.attributeNewValue !== null) {
      const newText = viewWriter.createText(data.attributeNewValue);
      viewWriter.insert(viewWriter.createPositionAt(element, 0), newText);
    }
  }
}

function optionsAttributeConverter() {
  return dispatcher => {
    dispatcher.on(`attribute:options:${MODEL_NAME}`, converter);
  };

  function converter(evt, data, conversionApi) {
    if (!conversionApi.consumable.consume(data.item, evt.name)) {
      return;
    }

    const viewWriter = conversionApi.writer;
    const element = conversionApi.mapper.toViewElement(data.item);

    if (data.attributeNewValue !== null) {
      viewWriter.setAttribute('data-options', data.attributeNewValue, element);
    } else {
      viewWriter.removeAttribute('data-options', element);
    }
  }
}
