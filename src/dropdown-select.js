import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import DropdownSelectEditing from './dropdown-select-editing';
import DropdownSelectUI from './dropdown-select-ui';
import DropdownSelectToolbar from './dropdown-select-toolbar';

export default class DropdownSelect extends Plugin {
  static get requires() {
    return [DropdownSelectEditing, DropdownSelectUI, DropdownSelectToolbar];
  }
}
