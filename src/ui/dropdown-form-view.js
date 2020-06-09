import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import { createLabeledInputText } from '@ckeditor/ckeditor5-ui/src/labeledfield/utils';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

export default class DropdownFormView extends View {
  constructor(locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.inputView = this._createInput();

    this.saveButtonView = this._createButton(t('Save'), checkIcon, 'ck-button-save');
    this.saveButtonView.type = 'submit';

    this.cancelButtonView = this._createButton(t('Cancel'), cancelIcon, 'ck-button-cancel', 'cancel');

    this._focusables = new ViewCollection();

    this._focusCycler = new FocusCycler({
      focusables: this._focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate form fields backwards using the Shift + Tab keystroke.
        focusPrevious: 'shift + tab',

        // Navigate form fields forwards using the Tab key.
        focusNext: 'tab'
      }
    });

    this.setTemplate({
      tag: 'form',

      attributes: {
        class: [
          'ck',
          'ck-dropdown-form'
        ],

        tabindex: '-1'
      },

      children: [
        this.inputView,
        this.saveButtonView,
        this.cancelButtonView
      ]
    });
  }

  render() {
    super.render();

    submitHandler({
      view: this
    });

    const childViews = [
      this.inputView,
      this.saveButtonView,
      this.cancelButtonView
    ];

    childViews.forEach(v => {
      // Register the view as focusable.
      this._focusables.add(v);

      // Register the view in the focus tracker.
      this.focusTracker.add(v.element);
    });

    // Start listening for the keystrokes coming from #element.
    this.keystrokes.listenTo(this.element);

    const stopPropagation = data => data.stopPropagation();

    // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
    // keystroke handler would take over the key management in the URL input. We need to prevent
    // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
    this.keystrokes.set('arrowright', stopPropagation);
    this.keystrokes.set('arrowleft', stopPropagation);
    this.keystrokes.set('arrowup', stopPropagation);
    this.keystrokes.set('arrowdown', stopPropagation);

    // Intercept the "selectstart" event, which is blocked by default because of the default behavior
    // of the DropdownView#panelView.
    // TODO: blocking "selectstart" in the #panelView should be configurable per–drop–down instance.
    this.listenTo(this.inputView.element, 'selectstart', (evt, domEvt) => {
      domEvt.stopPropagation();
    }, { priority: 'high' });
  }

  open(val) {
    this.value = val || '';
    this.inputView.fieldView.select();
    this.focus();
  }

  focus() {
    this._focusCycler.focusFirst();
  }

  get value() {
    return this.inputView.fieldView.element.value.trim();
  }

  set value(val) {
    this.inputView.fieldView.element.value = val.trim();
  }

  isValid() {
    const t = this.locale.t;
    this.resetFormStatus();

    if (!this.value) {
      this.inputView.errorText = t('No input');
      return false;
    }

    return true;
  }

  resetFormStatus() {
    this.inputView.errorText = null;
  }

  _createInput() {
    const t = this.locale.t;

    const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
    const inputField = labeledInput.fieldView;

    labeledInput.label = t('Options');
    labeledInput.infoText = t('使用逗點(,)分隔選項');
    inputField.placeholder = 'opt1,opt2,...';

    return labeledInput;
  }

  _createButton(label, icon, className, eventName) {
    const button = new ButtonView(this.locale);

    button.set({
      label,
      icon,
      tooltip: true
    });

    button.extendTemplate({
      attributes: {
        class: className
      }
    });

    if (eventName) {
      button.delegate('execute').to(this, eventName);
    }

    return button;
  }
}
